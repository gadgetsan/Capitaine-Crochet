var express = require("express");
var helpers = require("./helpers");
var Task = require("./Task");
var router = express.Router();
const ynab = require("ynab");
const { Coda } = require("coda-js");

var bodyParser = require("body-parser");
var jsonParser = bodyParser.json();

router.get("/Export/" + process.env.HOOK_CODE, jsonParser, async function (
	req,
	res
) {
	var coda = await new Coda(process.env.CODA_KEY);
	const doc = await coda.getDoc(process.env.BUDGET_DOC_ID);
	const ynabAPI = new ynab.API(process.env.YNAB_ACCESS_TOKEN);
	const budgetsResponse = await ynabAPI.budgets.getBudgets();
	const budgets = budgetsResponse.data.budgets;
	var budgetId = budgets[0].id;
	//console.dir(accounts);

	//UPDATE ACCOUNTS START=============================================
	//on va aller chercher les rows dans Coda

	var accountsResponse = await ynabAPI.accounts.getAccounts(budgetId);
	var accounts = accountsResponse.data.accounts;
	var YNABAccountsMap = helpers.convertArrayToObject(accounts, "name");
	const table = await doc.getTable(process.env.ACCOUNT_TABLE_ID);
	const codaAccounts = await table.listRows({ useColumnNames: false });

	var conjointAcc = ["Conjoint", "Visa Desjardins Odyssey Gold"];
	for (let codaAccount of codaAccounts) {
		//console.log(codaGroup + " - " + codaCategory);
		var divider = 1000.0;
		var updateObj = {};
		var ynabAccount =
			YNABAccountsMap[
				codaAccount.values[process.env.ACCOUNT_NAME_COLUMN]
			];
		if (!ynabAccount) continue; //TODO créer les comptes non existant
		if (conjointAcc.includes(ynabAccount.name)) {
			divider = 2000.0;
		}
		console.log(codaAccount.values[process.env.ACCOUNT_NAME_COLUMN]);
		updateObj[process.env.ACCOUNT_AMOUNT_COLUMN] =
			ynabAccount.balance / divider;
		updateObj[process.env.ACCOUNT_INVALIDATED_AMMOUNT] =
			(ynabAccount.cleared_balance - ynabAccount.balance) / divider;
		await codaAccount.update(updateObj);
	}

	//UPDATE ACCOUNTS ENDS=============================================

	//UPDATE Budget Categories START=============================================
	var categoriesResponse = await ynabAPI.categories.getCategories(budgetId);
	var categoryGroups = categoriesResponse.data.category_groups;

	var YNABCategoryGroupsMap = helpers.convertArrayToObject(
		categoryGroups,
		"name"
	);
	for (const [key, value] of Object.entries(YNABCategoryGroupsMap)) {
		value.categories = helpers.convertArrayToObject(
			value.categories,
			"name"
		);
	}

	const budgetTable = await doc.getTable(process.env.BUDGET_TABLE_ID);
	const codaBudgets = await budgetTable.listRows({ useColumnNames: false });

	var toUpdate = [];
	for (let codaBudget of codaBudgets) {
		updateObj = codaBudget.values;
		var codaGroup = codaBudget.values[process.env.BUDGET_GROUP_COLUMN];
		var codaCategory =
			codaBudget.values[process.env.BUDGET_CATEGORY_COLUMN];
		//console.log(codaGroup + " - " + codaCategory);
		divider = 1000.0;
		var exclude = [
			"Internal Master Category",
			"Credit Card Payments",
			"Debt Payments"
		];
		if (codaGroup === "Conjoint") {
			divider = 2000.0;
		}
		if (exclude.includes(codaGroup)) {
			continue;
		}
		var categoryData =
			YNABCategoryGroupsMap[codaGroup].categories[codaCategory];
		updateObj[process.env.BUDGET_BEFORE_COLUMN] =
			(categoryData.balance -
				categoryData.activity -
				categoryData.budgeted) /
			divider;
		updateObj[process.env.BUDGET_BUDGETED_COLUMN] =
			categoryData.budgeted / divider;
		updateObj[process.env.BUDGET_SPENT_COLUMN] =
			categoryData.activity / divider;
		updateObj[process.env.BUDGET_LEFT_COLUMN] =
			categoryData.balance / divider;
		toUpdate.push(updateObj);
		//await codaBudget.update(updateObj);
	}
	budgetTable.insertRows(toUpdate, [
		process.env.BUDGET_GROUP_COLUMN,
		process.env.BUDGET_CATEGORY_COLUMN
	]);
	//console.log(YNABCategoryGroupsMap);

	res.send("Exported!");
});

module.exports = router;
