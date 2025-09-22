# Page snapshot

```yaml
- generic [active] [ref=e1]:
  - main [ref=e5]:
    - generic [ref=e7]:
      - generic [ref=e9]:
        - generic [ref=e10]:
          - generic [ref=e11]:
            - img [ref=e13]
            - heading "管理者ログイン" [level=2] [ref=e15]
            - paragraph [ref=e16]: COCOSiL診断システム管理画面
          - generic [ref=e17]:
            - generic [ref=e18]:
              - generic [ref=e19]:
                - text: 管理者パスワード
                - generic [ref=e20]: "*"
              - textbox "パスワードを入力" [ref=e21]
            - button "ログイン" [ref=e22] [cursor=pointer]
          - paragraph [ref=e24]:
            - text: 認証情報をお忘れの場合は、
            - text: システム管理者にお問い合わせください
        - link "← ホームに戻る" [ref=e26] [cursor=pointer]:
          - /url: /
      - button "🏷️ /admin• 管理者ダッシュボード - 認証・データ管理" [ref=e27] [cursor=pointer]:
        - text: 🏷️ /admin
        - generic [ref=e28] [cursor=pointer]: • 管理者ダッシュボード - 認証・データ管理
  - alert [ref=e29]
```