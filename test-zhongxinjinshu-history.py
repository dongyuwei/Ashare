from Ashare import *
from  MyTT import *

# 方式2: 指定结束日期 - 获取历史某段时间的数据
df = get_price('601061.XSHG', end_date='2025-09-12', count=30, frequency='1d')

# 方式3: 结合datetime使用动态日期
from datetime import datetime, timedelta
end = (datetime.now() - timedelta(days=30)).strftime('%Y-%m-%d')
df = get_price('601061.XSHG', end_date=end, count=60, frequency='1d')


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

if len(CLOSE) >= 2:
    prev_price = CLOSE[-2]
    prev_up, prev_mid, prev_lower = up[-2], mid[-2], lower[-2]
    
    # 1. 轨道穿越信号（严格）
    signals = []
    if prev_price <= prev_up and current_price > current_up:
        signals.append("⚡ 突破上轨 - 强势启动")
    elif prev_price >= prev_up and current_price < current_up:
        signals.append("⚡ 上轨回落 - 超买回调")
    elif prev_price >= prev_lower and current_price < current_lower:
        signals.append("⚡ 跌破下轨 - 恐慌抛售")
    elif prev_price <= prev_lower and current_price > current_lower:
        signals.append("⚡ 下轨反弹 - 超卖企稳")
    
    # 2. 中轨穿越信号（常用）
    if prev_price <= prev_mid and current_price > current_mid:
        signals.append("🔄 上穿中轨 - 趋势转强")
    elif prev_price >= prev_mid and current_price < current_mid:
        signals.append("🔄 跌破中轨 - 趋势转弱")
    
    # 3. 轨道内位置信号（新增：解决"无信号"问题）
    percent_b = (current_price - current_lower) / (current_up - current_lower)
    
    if not signals:  # 如果没有穿越信号，显示位置状态
        if percent_b > 0.9:
            signals.append(f"📊 逼近上轨({percent_b:.1%}) - 高压区，谨慎追高")
        elif percent_b > 0.7:
            signals.append(f"📊 强势区({percent_b:.1%}) - 通道上半部运行")
        elif percent_b > 0.5:
            signals.append(f"📊 中性偏强({percent_b:.1%}) - 靠近中轨上方")
        elif percent_b > 0.3:
            signals.append(f"📊 中性偏弱({percent_b:.1%}) - 靠近中轨下方")
        elif percent_b > 0.1:
            signals.append(f"📊 弱势区({percent_b:.1%}) - 通道下半部运行")
        else:
            signals.append(f"📊 逼近下轨({percent_b:.1%}) - 支撑区，关注反弹")
    
    # 4. 带宽状态信号
    boll_width = (current_up - current_lower) / current_mid
    width_change = boll_width / ((up[-5] - lower[-5]) / mid[-5]) if len(mid) >=5 else 1
    
    if width_change > 1.1:
        signals.append("🔥 布林带开口扩大 - 波动加剧，趋势将延续")
    elif width_change < 0.9:
        signals.append("😴 布林带收口 - 波动收敛，即将变盘")
    
    # 5. 连续N日位置信号
    above_mid = sum(CLOSE[-5:] > mid[-5:])  # 最近5日在中轨上的天数
    if above_mid >= 4:
        signals.append(f"📈 强势延续 - 近5日有{above_mid}日收在中轨上方")
    elif above_mid <= 1:
        signals.append(f"📉 弱势延续 - 近5日有{5-above_mid}日收在中轨下方")
    
    # 输出所有信号
    if signals:
        for s in signals:
            print(s)
    else:
        print("➖ 轨道突破: 暂无穿越信号")
        
    # 6. 操作建议（综合）
    print(f"\n=== 操作建议 ===")
    if percent_b > 0.9 and width_change > 1.05:
        print("建议: 持仓者考虑减仓，空仓者观望")
    elif percent_b < 0.1 and width_change > 1.05:
        print("建议: 关注反弹机会，可轻仓试多")
    elif 0.3 < percent_b < 0.7 and width_change < 0.9:
        print("建议: 震荡行情，高抛低吸或观望")
    else:
        print("建议: 跟随趋势，中轨上方偏多，中轨下方偏空")

else:
    print("数据不足，无法生成信号")

# 6. 可视化（可选）
import matplotlib.pyplot as plt

plt.figure(figsize=(12, 6))
plt.plot(CLOSE, label='收盘价', color='black', linewidth=1.5)
plt.plot(up, label='上轨', color='red', linestyle='--')
plt.plot(mid, label='中轨', color='blue', linestyle='-')
plt.plot(lower, label='下轨', color='green', linestyle='--')
plt.fill_between(range(len(CLOSE)), up, lower, alpha=0.1, color='gray')
plt.title('股价与布林带走势图')
plt.legend()
plt.grid(True, alpha=0.3)
plt.show()