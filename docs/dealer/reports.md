---
title: Reports
sidebar_position: 12
description: The four dealer reports (sales, inventory, profit and expense), how to read each one, and how filters and CSV export work.
---

# Reports

This page explains the four reports under **Reports** in the menu: what each one answers, the numbers it shows, and how to filter and export.

:::tip[In plain English]
[Financials](/docs/dealer/financials) shows the totals. **Reports** lets you slice them: by salesperson, by payment type, by car, by month. Use them when you need to answer a question such as "who sold the most last quarter?" or "how much is tied up in stock right now?"
:::

## Common behavior

- Each report has a **title**, a one-line summary of the current filters under it, and an **Export** button.
- **Export** downloads a **CSV** file of the data matching the current filters. The button reads "Exporting..." while it works, and an error with a retry button appears if it fails.
- Numbers are calculated on the server for the whole filtered set, not just the page shown.
- Filters live in the page address, so a filtered view can be bookmarked or shared with a colleague.
- Where there is a **Timeframe** control, **All** means no date limit, **Monthly** adds Year and Month pickers, and **Yearly** adds a Year picker.
- A **Reset** button clears filters where it is shown.
- The menu item **Documents → Monthly Report** is only a shortcut to the Sales Report.

## Sales Report

**Menu:** Reports → Sales Report (`/dashboard/reports/sales`). Page title: **Sales**.

Answers: how many cars sold, for how much, to whom, and who sold them.

| Filter | Options |
| --- | --- |
| Timeframe | All, Monthly, Yearly |
| Year, Month | When the timeframe is not All |
| Sales agent | All agents, or one agent |
| Payment method | All methods, or one method |
| Search | "Vehicle, buyer, agent, ref..." |

**Number cards**

| Card | Meaning |
| --- | --- |
| **Vehicles sold** | Count of sold vehicles in the filter. |
| **Revenue** | Total sold prices. |
| **Total profit** | Profit on those sales. |
| **Avg days to sell** | Average days from the purchase date (or, if none, the date the vehicle was added) to the sale date. |
| **Cash sales** | Amount and number of sales paid in cash. |
| **Financing** | Amount and number of sales paid through financing. |

**Agent performance** table: "Sales, revenue, and profit for the filtered sold-vehicle set." One row per sales agent. Columns are sortable. With nothing to show it says "No sold vehicles yet." or, when filters are on, "No agent sales match these filters."

## Inventory Report

**Menu:** Reports → Inventory Report (`/dashboard/reports/inventory`). Page title: **Inventory report**.

Answers: what is in stock and what is it worth? This is a snapshot of **now**, so it has no date range. The summary line reads like "Showing current inventory for all statuses".

| Filter | Options |
| --- | --- |
| Status | All statuses, or one status |
| Category | All categories, or one category |
| Search | "Vehicle, ref, plate, color..." |

**Number cards**

| Card | Meaning |
| --- | --- |
| **Active stock** | Vehicles not yet sold. |
| **Sold** | Vehicles already sold. |
| **Inventory value** | Total of the **posted prices** of active stock. This is asking value, not what the dealer paid. |
| **Total cost** | What the dealer has paid out for the active stock (purchase payments recorded for those vehicles). |

Below the cards is a paged list of vehicles, each with its **Posted Price**. Empty states: "No vehicles in inventory yet." and, with filters on, "No vehicles match these filters."

:::note
The gap between **Inventory value** and **Total cost** is the potential margin if every car sold at its posted price. It is not a profit forecast, because expenses and discounts are not included.
:::

## Profit Report

**Menu:** Reports → Profit Report (`/dashboard/reports/profit`). Page title: **Profit**.

Answers: where the profit comes from, by agent and by car.

Filters are the same as the Sales Report, except the search placeholder is "Vehicle or agent...".

**Number cards**

| Card | Meaning |
| --- | --- |
| **Gross profit** | Revenue minus cost minus vehicle expenses. |
| **Net profit** | Gross profit minus overhead. |
| **Revenue** | Total sold prices. |
| **Cost** | Total purchase cost of sold vehicles. |
| **Vehicle expenses** | Repairs and prep on those vehicles. |
| **Overhead** | Monthly running costs in the period. |
| **Units sold** | Count of sold vehicles. |
| **Avg profit / unit** | Profit divided by units. |

Two sortable tables follow:

| Table | Columns |
| --- | --- |
| **By agent** | Agent, Units, Revenue, Cost, Vehicle expenses, Gross profit |
| **By vehicle** | Vehicle, Agent, Units, Revenue, Cost, Vehicle expenses, Gross profit |

Empty states: "No profit data yet." and "No agent profit matches these filters." / "No vehicle profit matches these filters."

## Expense Report

**Menu:** Reports → Expense Report (`/dashboard/reports/expenses`). Page title: **Expenses**.

Answers: how much did we spend, and on what?

| Filter | Options |
| --- | --- |
| Timeframe | All, Monthly, Yearly |
| Category | **All**, **Vehicle** (per-car expenses), **Overhead** (monthly running costs) |
| Year, Month | When the timeframe is not All |

**Number cards:** **Vehicle expenses**, **Overhead**, **Total**.

Below them are a **Breakdown** of where the money went and a chart of **monthly overhead amounts**.

## Which report should I use?

| Question | Report |
| --- | --- |
| How many cars did we sell, and who sold them? | Sales Report |
| What is our stock worth today? | Inventory Report |
| Which cars or agents made the most profit? | Profit Report |
| What are our costs this year? | Expense Report |
| What is our overall profit after rent? | [Financials Summary](/docs/dealer/financials) |

## For developers

- Pages: `app/(session)/dashboard/reports/{sales,inventory,profit,expenses}/`; components in `components/reports/`; param and label helpers in `lib/reports/`.
- API: use cases under `src/use-cases/reports/` (`get-*-report` and `export-*-report`). The export use cases produce the CSV.
- Plans: `docs/plans/dry-75-sales-report.md` through `dry-78-expense-report.md` in the dealer repo.

## Related pages

- [Financials](/docs/dealer/financials)
- [Expenses and sales](/docs/dealer/expenses-and-sales)
- [Inventory](/docs/dealer/inventory)
- [Dashboard home](/docs/dealer/dashboard-home)
