import re

with open("c:\\Users\\win 10\\Desktop\\CANVA E FABRICA - JUNHO 26\\supabase\\functions\\stripe-dashboard\\index.ts", "r", encoding="utf-8") as f:
    content = f.read()

# 1. Remove Hotmart Data Fetch block
content = re.sub(r'\s*// ============ HOTMART DATA FETCH ============\n\s*const \{ data: allHotmartSalesData.*?const allHotmartSales = allHotmartSalesData \|\| \[\];\n', '\n', content, flags=re.DOTALL)

# 2. Remove Hotmart Aggregation loop
content = re.sub(r'\s*// ============ HOTMART AGGREGATION ============\n.*?const combinedMrr =', '\n    const combinedMrr =', content, flags=re.DOTALL)

# 3. Clean up the combined metrics variables
content = content.replace("mrr + hotmartMrr", "mrr")
content = content.replace("activeSubscriptions.data.length + hotmartActiveCount", "activeSubscriptions.data.length")
content = content.replace("customers.data.length + allHotmartSales.length", "customers.data.length")
content = content.replace("(allSubscriptions.data.length || 1) + hotmartActiveCount + hotmartCanceledCount", "(allSubscriptions.data.length || 1)")
content = content.replace("((canceledCount + hotmartCanceledCount) / combinedTotalSubscriptions)", "(canceledCount / combinedTotalSubscriptions)")
content = content.replace("currentMonthRevenue + hotmartCurrentMonthRevenue", "currentMonthRevenue")
content = content.replace("lastMonthRevenue + hotmartLastMonthRevenue", "lastMonthRevenue")
content = content.replace("lastMonthRevenueMTD + hotmartLastMonthRevenueMTD", "lastMonthRevenueMTD")
content = content.replace("(totalRevenue + hotmartTotalRevenue)", "totalRevenue")
content = content.replace("monthlyChurns + hotmartMonthlyChurns", "monthlyChurns")

with open("c:\\Users\\win 10\\Desktop\\CANVA E FABRICA - JUNHO 26\\supabase\\functions\\stripe-dashboard\\index.ts", "w", encoding="utf-8") as f:
    f.write(content)
