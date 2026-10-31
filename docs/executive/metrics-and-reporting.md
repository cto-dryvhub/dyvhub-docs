---
title: Metrics and reporting
sidebar_position: 7
description: What numbers leaders can see today, what the data could answer with effort, and what DryvHub cannot measure yet.
---

# Metrics and reporting

:::tip[Key takeaways]
- Dealers have good **self-service reporting** on their own business (sales, profit, inventory, expenses). **DryvHub leadership has no platform-level dashboard**.
- Platform questions (how many dealers, how many inquiries, how many claims paid) **can be answered from the database**, but only by an engineer running a query. Nothing in the repositories produces a regular business report.
- **No analytics or monitoring tools** were found in any of the three apps (no web analytics, error tracking, or uptime tooling in the dependencies). Marketplace visits, search behavior, and drop-off are **not measured**.
- The KPI list at the end is **a suggestion by the author**, not an existing practice.
:::

## 1. Visible today

### Dealer-level reporting (inside the Dealer app)

Each dealer sees only their own numbers, scoped to their dealership.

| Where | What is shown |
| --- | --- |
| Dashboard home | Sales, profit per unit, days on the lot, units; inventory status summary |
| Sales report | Vehicles sold, revenue, total profit, average days to sell, cash vs financing sales, a table by agent |
| Inventory report | Active stock, units sold, inventory value, total cost, vehicle list |
| Profit report | Revenue, cost, gross profit, net profit, vehicle expenses, overhead, units sold, average profit per unit, trend |
| Expense report | Vehicle expenses, overhead, total, trend |
| Financials | Sales summary, financial summary, payments |
| Cashback page | The dealer's own claims and their status |
| Inquiries page | Inquiries received on the dealer's cars |

### Platform-level screens (for DryvHub staff)

| Where | What is shown | Caveat |
| --- | --- | --- |
| Admin home | A queue of dealers waiting for verification and a list of dealers flagged for follow-up | Counts are queues, not trends. The follow-up data comes from API routes we could not find |
| Verification review | One dealer's documents, details, and decision | Per dealer, not aggregate |
| Admin tenants and vehicles | Lists across dealers | These call API routes we did **not** find in the API repository, so they may not work against the current backend |
| Cashback review | **API only.** List and filter claims by status, review, pay out | No screen found |
| Platform settings | **API only.** Read and change cashback rates and promotions | No screen found |

### What the system records (even if nobody looks at it)

| Data | What it could tell you |
| --- | --- |
| Dealership created date, plan, subscription status, trial dates | Signups over time, plan mix |
| Verification submitted time and each review decision with its time | Time to review, approval and rejection rates |
| Vehicle listed date, sold date, sold price | Time on market, sales volume, GMV of cars sold through dealers |
| Inquiry record: car, dealer, time, source and entry point (card vs details page), locked cashback rate | Inquiries per car and per dealer, where buyers click |
| Cashback record: status, review reason and time, payout reference, retries, locked rate, amounts | Claim volume, approval rate, time to pay, money owed and paid |
| Dealer strikes | Fraud frequency per dealer |
| Audit log entries for verification decisions, cashback decisions, payouts | Who decided what and when |

## 2. Not measurable today

| Question | Why it is not answerable |
| --- | --- |
| How many people visit the Marketplace, and what they search for | No analytics tool in the buyer site |
| Visit → inquiry conversion | Needs visit counts |
| Inquiry → sale conversion | A sale record does not link to an inquiry. The link exists only when a buyer files a cashback claim |
| How many Messenger chats actually happen | Messenger activity is outside DryvHub; some inquiries never send the message |
| Messenger response time from dealers | Same reason |
| Dealer revenue actually collected | There is no billing engine or payment record |
| Revenue from cashback (the platform's share) | Computed and stored per claim, but there is no ledger of money received from dealers |
| Dealer churn and reason | No cancellation flow or exit data |
| Errors, slow pages, and uptime | No monitoring tools found |
| Dealer satisfaction and buyer satisfaction | No survey or rating feature |
| How long an admin takes to answer a cashback claim | The review time is recorded but nothing reports it |

:::warning Do not quote numbers from the apps as company metrics
Dealer-level figures are accurate **for that dealer's own records only** and depend on dealers entering data correctly. Nothing in the Dealer app aggregates across dealerships for leadership.
:::

## 3. Suggested KPI set

:::note This section is a suggestion, not current practice
These are **the author's proposals** based on the data the platform already stores. None of them is published today. Targets are intentionally left blank because DryvHub has not documented any.
:::

### Supply (dealers)

| KPI | Source | Effort |
| --- | --- | --- |
| New dealer signups per week | Dealership created date | Query |
| Submitted vs signed up (onboarding completion rate) | Verification submitted time | Query |
| Median time from submit to decision; approval rate | Verification decisions | Query |
| Dealers on a paid plan with valid subscription | Plan and subscription status | Query |
| Dealers with at least one published car | Listing status | Query |

### Demand (buyers)

| KPI | Source | Effort |
| --- | --- | --- |
| Marketplace visits and listing views | A web analytics tool | **New tool** needed |
| Inquiries per week; inquiries per published car | Inquiry records | Query |
| Share of inquiries from card vs details page | Inquiry entry point | Query |

### Outcome (sales and cashback)

| KPI | Source | Effort |
| --- | --- | --- |
| Cars sold by dealers that had a Marketplace inquiry | Needs an inquiry link on the sale | **Product change** |
| Cashback claims per week; approval rate; median time to payout | Cashback records | Query |
| Cashback paid (₱) and platform amount (₱) | Cashback records | Query |
| Dealer disputes and strikes | Cashback and strike records | Query |

### Health

| KPI | Source | Effort |
| --- | --- | --- |
| API error rate and response time | Monitoring tool | **New tool** needed |
| Admin queue age (oldest pending verification, oldest pending claim) | Existing timestamps | Query or admin screen |
| Failed Facebook posts | Facebook sync result on listings | Query |

:::tip Smallest useful step
A weekly query-based report covering the supply and outcome rows above needs no product changes. Web analytics and monitoring each need one new tool.
:::

## Related pages

- [Overview](/docs/executive/overview)
- [Product status](/docs/executive/product-status)
- [Risks and dependencies](/docs/executive/risks-and-dependencies)
- [Dealer reports](/docs/dealer/reports)
- [Dealer financials](/docs/dealer/financials)
- [Admin portal](/docs/dealer/admin-portal)
- [Data model](/docs/developers/data-model)
