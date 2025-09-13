#!/usr/bin/env python3
"""
正解データ分析スクリプト
2008/1/5の正解データから動物占いと六星占術の正確な計算式を逆算
"""

import datetime

def date_to_excel_serial(year, month, day):
    """Excel シリアル値変換 (1900年基準)"""
    target_date = datetime.date(year, month, day)
    base_date = datetime.date(1900, 1, 1)
    
    # 日数差を計算
    diff_days = (target_date - base_date).days
    
    # Excel の1900年うるう年バグを考慮
    # 1900年3月1日以降は+1日のずれがある
    if target_date >= datetime.date(1900, 3, 1):
        diff_days += 1
    
    # Excel は1900年1月1日を1とする
    return diff_days + 1

def analyze_test_case(year, month, day, expected_animal, expected_six_star):
    """テストケースの分析"""
    serial = date_to_excel_serial(year, month, day)
    
    print(f"\n=== {year}/{month}/{day} ===")
    print(f"Excel シリアル値: {serial}")
    print(f"期待結果:")
    print(f"  動物: {expected_animal}")
    print(f"  六星: {expected_six_star}")
    
    # 様々な計算式を試す
    formulas = [
        ("(シリアル + 8) % 60 + 1", (serial + 8) % 60 + 1),
        ("(シリアル + 7) % 60 + 1", (serial + 7) % 60 + 1),
        ("(シリアル + 9) % 60 + 1", (serial + 9) % 60 + 1),
        ("(シリアル + 0) % 60 + 1", (serial + 0) % 60 + 1),
        ("(シリアル - 1) % 60 + 1", (serial - 1) % 60 + 1),
        ("シリアル % 60 + 1", serial % 60 + 1),
    ]
    
    print("動物占い計算式テスト:")
    for formula_name, result in formulas:
        print(f"  {formula_name}: {result}")
    
    # 六星占術の計算式テスト
    six_star_formulas = [
        ("(year + month + day) % 12", (year + month + day) % 12),
        ("(year + month * 12 + day) % 12", (year + month * 12 + day) % 12),
        ("(year + month * 100 + day) % 12", (year + month * 100 + day) % 12),
        ("serial % 12", serial % 12),
        ("(serial + 6) % 12", (serial + 6) % 12),
        ("(year * 7 + month * 3 + day) % 12", (year * 7 + month * 3 + day) % 12),
    ]
    
    print("六星占術計算式テスト:")
    for formula_name, result in six_star_formulas:
        print(f"  {formula_name}: {result}")

def main():
    """メイン処理"""
    print("正解データ分析開始")
    
    # 正解データのテストケース
    test_cases = [
        (2008, 1, 5, "大器晩成のたぬき", "木星人+"),
        # 他のケースも追加可能
    ]
    
    for year, month, day, animal, six_star in test_cases:
        analyze_test_case(year, month, day, animal, six_star)
    
    print("\n=== 参考情報 ===")
    print("動物占い60種:")
    print("  たぬき系: 16-18, 43-45 など")
    print("六星占術12種:")
    print("  木星人+: インデックス4")
    print("  木星人-: インデックス10")

if __name__ == "__main__":
    main()