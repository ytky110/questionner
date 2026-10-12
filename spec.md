# フラッシュカード

## メイン画面

- 真ん中に単語
- 下に入力ボックス
- 右下に次へボタン

## 作成画面

## 配布画面

- Githubのリポジトリそのまま？

## 単語帳ファイル

JSON

- 問題[]
    - 問題タイプ string
        - 選択 "choice"
        - 自己判定 "self"

    - 問題 string
    - 選択肢 string[]
    - 解答 string

```
{
    "questions": [
        {
            type;
            question;
            choices?;
            answer;
        }
    ]
}
```
