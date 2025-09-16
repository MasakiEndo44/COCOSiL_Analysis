-- ================================================================
-- 体癖診断システム データベーススキーマ
-- Version: 1.0.0
-- Created: 2025-01-16
-- ================================================================

-- ============================================================
-- 質問マスタテーブル（4択制約対応）
-- ============================================================
CREATE TABLE taiheki_questions (
  id INT PRIMARY KEY,
  text TEXT NOT NULL,
  type ENUM('single', 'scale') NOT NULL,
  category ENUM('physical', 'behavioral', 'mental', 'social') NOT NULL,
  base_weight DECIMAL(3,2) DEFAULT 1.00,
  max_selections INT DEFAULT 1 COMMENT '単一選択=1, 複数選択可能=2',
  display_order INT NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- ============================================================
-- 選択肢テーブル（厳密4択制御）
-- ============================================================
CREATE TABLE taiheki_options (
  question_id INT NOT NULL,
  option_index INT NOT NULL CHECK (option_index BETWEEN 0 AND 3) COMMENT '4択制限: 0-3',
  text TEXT NOT NULL,
  
  -- 10体癖タイプスコア（小数点精度向上）
  type1_score DECIMAL(4,2) DEFAULT 0.00,
  type2_score DECIMAL(4,2) DEFAULT 0.00,
  type3_score DECIMAL(4,2) DEFAULT 0.00,
  type4_score DECIMAL(4,2) DEFAULT 0.00,
  type5_score DECIMAL(4,2) DEFAULT 0.00,
  type6_score DECIMAL(4,2) DEFAULT 0.00,
  type7_score DECIMAL(4,2) DEFAULT 0.00,
  type8_score DECIMAL(4,2) DEFAULT 0.00,
  type9_score DECIMAL(4,2) DEFAULT 0.00,
  type10_score DECIMAL(4,2) DEFAULT 0.00,
  
  confidence_level DECIMAL(3,2) DEFAULT 1.00 COMMENT '選択肢の確度 0.00-1.00',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  PRIMARY KEY (question_id, option_index),
  FOREIGN KEY (question_id) REFERENCES taiheki_questions(id) ON DELETE CASCADE
);

-- ============================================================
-- セッション管理テーブル（プログレッシブ診断用）
-- ============================================================
CREATE TABLE taiheki_sessions (
  id VARCHAR(36) PRIMARY KEY COMMENT 'UUID',
  current_question INT DEFAULT 1,
  answers JSON COMMENT '回答履歴 [{questionId: 1, selectedOptions: [0, 1]}, ...]',
  progress_data JSON COMMENT 'フロントエンド計算用暫定データ',
  status ENUM('active', 'completed', 'expired', 'abandoned') DEFAULT 'active',
  expires_at TIMESTAMP NOT NULL,
  completed_at TIMESTAMP NULL,
  user_agent TEXT COMMENT 'ブラウザ情報（匿名化分析用）',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  INDEX idx_status (status),
  INDEX idx_expires_at (expires_at),
  INDEX idx_created_at (created_at)
);

-- ============================================================
-- 診断結果テーブル（分析・統計用）
-- ============================================================
CREATE TABLE taiheki_results (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  session_id VARCHAR(36),
  
  -- 診断結果データ
  primary_type ENUM(
    'type1', 'type2', 'type3', 'type4', 'type5', 
    'type6', 'type7', 'type8', 'type9', 'type10'
  ) NOT NULL,
  secondary_type ENUM(
    'type1', 'type2', 'type3', 'type4', 'type5', 
    'type6', 'type7', 'type8', 'type9', 'type10'
  ) NOT NULL,
  confidence_score DECIMAL(4,3) NOT NULL COMMENT '信頼度 0.000-1.000',
  
  -- 全スコア詳細（分析用）
  all_scores JSON NOT NULL COMMENT '{type1: 45.2, type2: 23.1, ...}',
  
  -- 診断メタ情報
  total_questions INT NOT NULL,
  completion_time_seconds INT COMMENT '診断完了時間（秒）',
  answer_pattern_hash VARCHAR(32) COMMENT '回答パターンのハッシュ（重複検知用）',
  
  -- 統計・分析用
  user_feedback ENUM('accurate', 'partial', 'inaccurate') COMMENT '精度改善用フィードバック',
  ip_hash VARCHAR(64) COMMENT 'IPアドレスハッシュ（匿名化済み）',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (session_id) REFERENCES taiheki_sessions(id) ON DELETE SET NULL,
  INDEX idx_primary_type (primary_type),
  INDEX idx_confidence_score (confidence_score),
  INDEX idx_created_at (created_at),
  INDEX idx_completion_time (completion_time_seconds),
  INDEX idx_answer_pattern (answer_pattern_hash)
);

-- ============================================================
-- 診断統計サマリーテーブル（パフォーマンス向上用）
-- ============================================================
CREATE TABLE taiheki_daily_stats (
  stat_date DATE PRIMARY KEY,
  total_diagnoses INT DEFAULT 0,
  completed_diagnoses INT DEFAULT 0,
  average_completion_time DECIMAL(6,2) DEFAULT 0.00,
  type_distribution JSON COMMENT '{type1: 15, type2: 23, ...}',
  confidence_breakdown JSON COMMENT '{high: 45, medium: 23, low: 12}',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- ============================================================
-- インデックス最適化
-- ============================================================

-- セッション管理最適化
CREATE INDEX idx_sessions_active_expires ON taiheki_sessions(status, expires_at);
CREATE INDEX idx_sessions_created_status ON taiheki_sessions(created_at, status);

-- 結果分析最適化
CREATE INDEX idx_results_date_type ON taiheki_results(DATE(created_at), primary_type);
CREATE INDEX idx_results_confidence_date ON taiheki_results(confidence_score, DATE(created_at));

-- 統計クエリ最適化
CREATE INDEX idx_daily_stats_date ON taiheki_daily_stats(stat_date DESC);

-- ============================================================
-- 初期データ設定
-- ============================================================

-- 体癖タイプマスターデータ（参照用）
CREATE TABLE taiheki_types (
  type_key VARCHAR(10) PRIMARY KEY,
  name VARCHAR(20) NOT NULL,
  subtitle VARCHAR(50) NOT NULL,
  description TEXT NOT NULL,
  category ENUM('上下型', '左右型', '前後型', '捻れ型', '開閉型') NOT NULL,
  sub_category VARCHAR(20) NOT NULL
);

INSERT INTO taiheki_types (type_key, name, subtitle, description, category, sub_category) VALUES
('type1', '1種体癖', '上下型・論理的思考型', '理論的で論理的な思考を重視。物事を言葉で説明し、善悪の判断を大切にします。', '上下型', '論理的思考型'),
('type2', '2種体癖', '上下型・心配性型', '慎重で真面目、マニュアルを重視。不安を感じやすく、準備を大切にします。', '上下型', '心配性型'),
('type3', '3種体癖', '左右型・感情表出型', '感情豊かで明るく社交的。美味しいものや楽しいことが大好きなムードメーカー。', '左右型', '感情表出型'),
('type4', '4種体癖', '左右型・感情抑制型', 'クールで感情を抑制。他人の気持ちに寄り添い、調和を大切にします。', '左右型', '感情抑制型'),
('type5', '5種体癖', '前後型・行動的合理型', '行動的で合理的。効率を重視し、常に動き回るエネルギッシュなタイプ。', '前後型', '行動的合理型'),
('type6', '6種体癖', '前後型・内向的理想型', '理想家でロマンチスト。静かで内向的ですが、高い理想を追求します。', '前後型', '内向的理想型'),
('type7', '7種体癖', '捻れ型・闘争型', '闘志にあふれ、競争心が強い。親分肌でリーダーシップを発揮します。', '捻れ型', '闘争型'),
('type8', '8種体癖', '捻れ型・忍耐型', '我慢強く地道な努力家。義理堅く、縁の下の力持ちタイプ。', '捻れ型', '忍耐型'),
('type9', '9種体癖', '開閉型・集中型', '凝り性で完璧主義。一つのことに集中し、深く極めることを好みます。', '開閉型', '集中型'),
('type10', '10種体癖', '開閉型・包容型', '包容力があり世話好き。大らかで、みんなをまとめる親分肌。', '開閉型', '包容型');

-- ============================================================
-- データ整合性チェック関数
-- ============================================================

DELIMITER $$

-- セッション期限切れクリーンアップ
CREATE EVENT taiheki_cleanup_expired_sessions
ON SCHEDULE EVERY 1 HOUR
DO
BEGIN
  UPDATE taiheki_sessions 
  SET status = 'expired' 
  WHERE status = 'active' AND expires_at < NOW();
  
  DELETE FROM taiheki_sessions 
  WHERE status = 'expired' AND created_at < DATE_SUB(NOW(), INTERVAL 7 DAY);
END$$

-- 日次統計更新
CREATE EVENT taiheki_update_daily_stats
ON SCHEDULE EVERY 1 DAY
STARTS DATE_ADD(CURDATE(), INTERVAL 1 DAY) + INTERVAL 1 HOUR
DO
BEGIN
  INSERT INTO taiheki_daily_stats (
    stat_date, 
    total_diagnoses, 
    completed_diagnoses,
    average_completion_time,
    type_distribution,
    confidence_breakdown
  )
  SELECT 
    DATE(created_at),
    COUNT(*),
    COUNT(CASE WHEN status = 'completed' THEN 1 END),
    AVG(completion_time_seconds),
    JSON_OBJECT(
      'type1', COUNT(CASE WHEN primary_type = 'type1' THEN 1 END),
      'type2', COUNT(CASE WHEN primary_type = 'type2' THEN 1 END),
      'type3', COUNT(CASE WHEN primary_type = 'type3' THEN 1 END),
      'type4', COUNT(CASE WHEN primary_type = 'type4' THEN 1 END),
      'type5', COUNT(CASE WHEN primary_type = 'type5' THEN 1 END),
      'type6', COUNT(CASE WHEN primary_type = 'type6' THEN 1 END),
      'type7', COUNT(CASE WHEN primary_type = 'type7' THEN 1 END),
      'type8', COUNT(CASE WHEN primary_type = 'type8' THEN 1 END),
      'type9', COUNT(CASE WHEN primary_type = 'type9' THEN 1 END),
      'type10', COUNT(CASE WHEN primary_type = 'type10' THEN 1 END)
    ),
    JSON_OBJECT(
      'high', COUNT(CASE WHEN confidence_score >= 0.75 THEN 1 END),
      'medium', COUNT(CASE WHEN confidence_score >= 0.50 AND confidence_score < 0.75 THEN 1 END),
      'low', COUNT(CASE WHEN confidence_score < 0.50 THEN 1 END)
    )
  FROM taiheki_results 
  WHERE DATE(created_at) = DATE_SUB(CURDATE(), INTERVAL 1 DAY)
  GROUP BY DATE(created_at)
  ON DUPLICATE KEY UPDATE 
    total_diagnoses = VALUES(total_diagnoses),
    completed_diagnoses = VALUES(completed_diagnoses),
    average_completion_time = VALUES(average_completion_time),
    type_distribution = VALUES(type_distribution),
    confidence_breakdown = VALUES(confidence_breakdown),
    updated_at = CURRENT_TIMESTAMP;
END$$

DELIMITER ;

-- ============================================================
-- セキュリティ設定
-- ============================================================

-- 個人情報保護のためのビュー（匿名化済みデータのみ）
CREATE VIEW taiheki_analytics_view AS
SELECT 
  id,
  primary_type,
  secondary_type,
  confidence_score,
  total_questions,
  completion_time_seconds,
  DATE(created_at) as diagnosis_date,
  HOUR(created_at) as diagnosis_hour
FROM taiheki_results
WHERE created_at > DATE_SUB(NOW(), INTERVAL 30 DAY);

-- 管理画面用の統計ビュー
CREATE VIEW taiheki_admin_stats_view AS
SELECT 
  COUNT(*) as total_diagnoses,
  COUNT(CASE WHEN DATE(created_at) = CURDATE() THEN 1 END) as today_diagnoses,
  COUNT(CASE WHEN created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY) THEN 1 END) as weekly_diagnoses,
  COUNT(CASE WHEN created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY) THEN 1 END) as monthly_diagnoses,
  AVG(completion_time_seconds) as avg_completion_time,
  COUNT(CASE WHEN confidence_score >= 0.75 THEN 1 END) / COUNT(*) as high_confidence_rate
FROM taiheki_results
WHERE created_at > DATE_SUB(NOW(), INTERVAL 90 DAY);

-- ============================================================
-- マイグレーション完了
-- ============================================================

-- マイグレーションバージョン記録
INSERT IGNORE INTO schema_migrations (version, executed_at) 
VALUES ('001_taiheki_diagnosis_system', NOW());