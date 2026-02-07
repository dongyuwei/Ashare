#股市行情数据获取和作图 -2
from  Ashare import *          #股票数据库    https://github.com/mpquant/Ashare
from  MyTT import *            #myTT麦语言工具函数指标库  https://github.com/mpquant/MyTT
    
# 证券代码兼容多种格式 通达信，同花顺，聚宽
# sh000001 (000001.XSHG)    sz399006 (399006.XSHE)   sh600519 ( 600519.XSHG ) 

df=get_price('601061.XSHG',frequency='1d',count=120)      #获取今天往前120天的日线实时行情
print('上证指数日线行情\n',df.tail(5))

#-------有数据了，下面开始正题 -------------
CLOSE=df.close.values;         OPEN=df.open.values           
HIGH=df.high.values;           LOW=df.low.values             

MA5=MA(CLOSE,5)                                
MA10=MA(CLOSE,10)                              
up,mid,lower=BOLL(CLOSE)                       

# ================== BOLL 走势判断 ==================

# 1. 当前股价与布林带位置关系
current_price = CLOSE[-1]  
current_up = up[-1]        
current_mid = mid[-1]      
current_lower = lower[-1]  

print(f"\n=== 当前BOLL状态分析 ===")
print(f"最新收盘价: {current_price:.2f}")
print(f"布林上轨: {current_up:.2f}")
print(f"布林中轨: {current_mid:.2f}")
print(f"布林下轨: {current_lower:.2f}")

# 2. 判断股价所在区域
if current_price > current_up:
    position = "上轨之上 🚨 超买区域"
elif current_price > current_mid:
    position = "中轨与上轨之间 📈 强势区域"
elif current_price > current_lower:
    position = "中轨与下轨之间 📉 弱势区域"
else:
    position = "下轨之下 🚨 超卖区域"
print(f"当前位置: {position}")

# 3. 布林带开口/收口判断
boll_width = (up - lower) / mid  
current_width = boll_width[-1]
prev_width = boll_width[-5] if len(boll_width) >= 5 else boll_width[0]

if current_width > prev_width * 1.05:
    trend = "开口扩大 🔥 波动加剧，趋势可能启动"
elif current_width < prev_width * 0.95:
    trend = "收口收窄 😴 波动减小，可能变盘"
else:
    trend = "开口平稳 ➡️ 震荡行情"
print(f"带宽状态: {current_width:.4f} - {trend}")

# 4. 中轨趋势判断
mid_slope = mid[-1] - mid[-5] if len(mid) >= 5 else 0
if mid_slope > 0:
    mid_trend = "向上 📈"
elif mid_slope < 0:
    mid_trend = "向下 📉"
else:
    mid_trend = "走平 ➡️"
print(f"中轨趋势: {mid_trend}")

# ================== 交易信号参考 ==================
print(f"\n=== 交易信号参考 ===")

# 确保至少有2天数据
if len(CLOSE) >= 2:
    prev_price = CLOSE[-2]
    
    # A. 轨道突破信号（严格定义：穿越）
    if prev_price <= current_up and current_price > current_up:
        print("⚡ 突破信号: 突破上轨，强势上涨")
    elif prev_price >= current_up and current_price < current_up:
        print("⚡ 突破信号: 从上轨回落，注意回调")
    elif prev_price >= current_lower and current_price < current_lower:
        print("⚡ 突破信号: 跌破下轨，加速下跌")
    elif prev_price <= current_lower and current_price > current_lower:
        print("⚡ 突破信号: 从下轨反弹，可能企稳")
    else:
        print("➖ 轨道突破: 暂无穿越信号")
    
    # B. 中轨穿越信号（更常用的交易信号）
    prev_mid = mid[-2]
    if prev_price <= prev_mid and current_price > current_mid:
        print("🔄 中轨信号: 上穿中轨，趋势转强（买入参考）")
    elif prev_price >= prev_mid and current_price < current_mid:
        print("🔄 中轨信号: 跌破中轨，趋势转弱（卖出参考）")
    else:
        if current_price > current_mid:
            print("🔄 中轨信号: 运行在中轨上方，维持强势")
        else:
            print("🔄 中轨信号: 运行在中轨下方，维持弱势")
    
    # C. 极端位置提醒（不需要穿越，只看当前位置）
    percent_b = (current_price - current_lower) / (current_up - current_lower)
    if percent_b > 0.95:
        print("⚠️  极端提醒: 接近上轨，注意回调风险")
    elif percent_b < 0.05:
        print("⚠️  极端提醒: 接近下轨，关注反弹机会")
    else:
        print(f"📊 位置评估: 布林带%B位置 {percent_b:.1%}")
        
else:
    print("数据不足，无法生成交易信号")

# # 6. 可视化（可选）
# import matplotlib.pyplot as plt

# plt.figure(figsize=(12, 6))
# plt.plot(CLOSE, label='收盘价', color='black', linewidth=1.5)
# plt.plot(up, label='上轨', color='red', linestyle='--')
# plt.plot(mid, label='中轨', color='blue', linestyle='-')
# plt.plot(lower, label='下轨', color='green', linestyle='--')
# plt.fill_between(range(len(CLOSE)), up, lower, alpha=0.1, color='gray')
# plt.title('股价与布林带走势图')
# plt.legend()
# plt.grid(True, alpha=0.3)
# plt.show()