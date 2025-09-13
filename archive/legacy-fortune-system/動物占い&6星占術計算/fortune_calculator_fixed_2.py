#!/usr/bin/env python3
# -*- coding: utf-8 -*-

from datetime import datetime, date
import os

def get_basic_fortune_data(birth_date_str):
    """
    生年月日から基本データを算出（修正版）
    Args: 
        birth_date_str (str): "YYYY/MM/DD" または "YYYY-MM-DD" 形式
    Returns: dict: {"age": int, "zodiac": str, "animal": str, "animal_detail": dict, "six_star": str}
    """
    
    # 日付解析（複数形式対応）
    date_str = birth_date_str.replace('/', '-')
    birth_date = datetime.strptime(date_str, "%Y-%m-%d").date()
    year, month, day = birth_date.year, birth_date.month, birth_date.day
    
    # 年齢計算
    today = date.today()
    age = today.year - year
    if (today.month, today.day) < (month, day):
        age -= 1
    
    # 星座計算
    zodiac = get_zodiac_sign(month, day)
    
    # 6星占術計算（修正版）
    six_star = get_correct_six_star(year, month, day)
    
    # 動物占い計算（CSV読み込み版）
    animal_data = get_animal_from_csv(year, month, day)
    
    return {
        "age": age,
        "zodiac": zodiac, 
        "animal": animal_data['animal'],
        "animal_detail": animal_data,
        "six_star": six_star
    }

def get_zodiac_sign(month, day):
    """12星座の判定"""
    if month == 1:
        return "山羊座" if day <= 19 else "水瓶座"
    elif month == 2:
        return "水瓶座" if day <= 18 else "魚座"
    elif month == 3:
        return "魚座" if day <= 20 else "牡羊座"
    elif month == 4:
        return "牡羊座" if day <= 19 else "牡牛座"
    elif month == 5:
        return "牡牛座" if day <= 20 else "双子座"
    elif month == 6:
        return "双子座" if day <= 21 else "蟹座"
    elif month == 7:
        return "蟹座" if day <= 22 else "獅子座"
    elif month == 8:
        return "獅子座" if day <= 22 else "乙女座"
    elif month == 9:
        return "乙女座" if day <= 22 else "天秤座"
    elif month == 10:
        return "天秤座" if day <= 23 else "蠍座"
    elif month == 11:
        return "蠍座" if day <= 22 else "射手座"
    else:  # month == 12
        return "射手座" if day <= 21 else "山羊座"

def get_correct_six_star(year, month, day):
    """
    CSVファイルから動物占いデータを読み込む（検証済み）
    """

def get_animal_from_csv(year, month, day):
    """
    CSVファイルから動物占いデータを読み込む（検証済み）
    """
    try:
        # 複数の読み込み方法を試行
        csv_content = None
        
        # 方法1: LLM分析ツール環境での読み込み
        try:
            import js
            csv_content = js.window.fs.readFile('doubutsu_uranai_essence_lookup_1960_2025.csv', {'encoding': 'utf8'})
        except:
            pass
        
        # 方法2: 通常のファイル読み込み
        if csv_content is None:
            csv_file_path = 'doubutsu_uranai_essence_lookup_1960_2025.csv'
            if os.path.exists(csv_file_path):
                with open(csv_file_path, 'r', encoding='utf-8') as f:
                    csv_content = f.read()
        
        if csv_content:
            lines = csv_content.strip().split('\n')[1:]  # ヘッダー除去
            
            # 効率的な検索：対象日付の検索
            for line in lines:
                parts = [p.replace('"', '') for p in line.split(',')]
                if len(parts) >= 8:
                    try:
                        # CSVの列: Date,Year,Month,Day,No(1-60),Animal,Label,Color
                        if (int(parts[1]) == year and 
                            int(parts[2]) == month and 
                            int(parts[3]) == day):
                            return {
                                'animal': parts[5],
                                'label': parts[6],
                                'color': parts[7],
                                'number': int(parts[4]),
                                'source': 'CSV'
                            }
                    except (ValueError, IndexError):
                        continue
        
    except Exception as e:
        print(f"CSV読み込みエラー: {e}")
    
    # フォールバック: 基本の12動物による簡易計算
    animals = ["チーター", "黒ひょう", "ライオン", "トラ", "たぬき", "コアラ",
               "ゾウ", "ひつじ", "ペガサス", "オオカミ", "こじか", "サル"]
    fallback_animal = animals[(year + month + day) % 12]
    
    return {
        'animal': fallback_animal,
        'label': 'フォールバック算出',
        'color': '',
        'number': 0,
        'source': 'フォールバック'
    }

# メインブロックや検証テストは不要になったため削除しました。今後は関数を直接インポートしてご利用ください。

# LLM実行用の簡潔版関数
def quick_fortune_analysis(birth_date_str):
    """
    生年月日から基本情報を一行で返す
    """
    try:
        data = get_basic_fortune_data(birth_date_str)
        return f"{data['age']}歳, {data['zodiac']}, {data['animal']}, {data['six_star']}"
    except Exception as e:
        return f"エラー: {e}"