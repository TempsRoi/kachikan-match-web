# playfutarishiru.com ドメイン移行手順

更新日: 2026-08-31

## 方針

- 正式URLは `https://playfutarishiru.com`（wwwなし）とする。
- 日本語版は `/`、英語版は `/en` で同じサービスとして運営する。
- `kachikanmatch.jp` と `www.kachikanmatch.jp` は、同じパスとクエリを保ったまま新ドメインへ恒久転送する。
- Stripe Webhookを安全に切り替えられるまで、旧ドメインの `/api/` は転送しない。
- `www.playfutarishiru.com` は `playfutarishiru.com` へ恒久転送する。

## 現在の状態

- [x] アプリ内のcanonical、OG、hreflang、構造化データを新ドメインへ変更
- [x] robots.txtとsitemap.xmlを新ドメインへ変更
- [x] 本番のStripe Checkout完了・キャンセルURLを新ドメインに固定
- [x] 旧ドメインとwwwからの308リダイレクトを実装
- [x] リダイレクトのパス・クエリ保持と旧Webhook除外をローカル本番ビルドで確認
- [x] Vercelプロジェクトに新ドメインを追加
- [x] VALUE-DOMAINのDNSをVercel指定値へ変更
- [ ] SSL発行と新旧URLの本番動作を確認
- [ ] Firebase AuthenticationのAuthorized domainsへ追加
- [ ] Stripe Webhook URLを新ドメインへ変更
- [ ] Google Search Consoleでアドレス変更を申請

## ユーザー作業 1: Vercelへドメインを追加

1. Vercel Dashboardで現在の `kachikan-match-web` プロジェクトを開く。
2. `Settings` → `Domains` → `Add Domain` を開く。
3. `playfutarishiru.com` を追加する。
4. `www.playfutarishiru.com` も同じプロジェクトへ追加する。
5. 正式ドメインは `playfutarishiru.com` とし、wwwは正式ドメインへRedirectする。
6. Vercelが表示したapex用Aレコードとwww用CNAMEレコードを控える。

Vercelの一般値ではなく、プロジェクト画面に表示された値を使用すること。

## ユーザー作業 2: VALUE-DOMAINのDNSを変更

現在のネームサーバーは `ns1.value-domain.com` / `ns2.value-domain.com`。Vercel接続用レコードは次のとおり。

```text
a @ 216.198.79.1
cname www 20ae2cc913bf6425.vercel-dns-017.com.
```

1. VALUE-DOMAINへログインする。
2. `ドメイン` → `ドメインの設定操作` → `playfutarishiru.com` の `DNS/URL` を開く。
3. apex（`@`）の既存Aレコードを、Vercelが指定したAレコードへ置き換える。
4. wwwの既存Aレコードまたはwwwに影響するワイルドカードを確認し、Vercel指定のCNAMEへ置き換える。
5. メール用のMX/TXTなど、Web公開と無関係なレコードがある場合は削除しない。
6. 保存後、VercelのDomains画面で再検証する。

## 接続後の管理画面作業

### Firebase

Firebase Consoleの `Authentication` → `Settings` → `Authorized domains` に、次を追加する。

- `playfutarishiru.com`
- `www.playfutarishiru.com`

移行期間中は `kachikanmatch.jp` と `www.kachikanmatch.jp` を削除しない。

### Stripe

Stripe WorkbenchのWebhook endpointを次へ変更する。

`https://playfutarishiru.com/api/stripe/webhook`

新URLでWebhookの成功を確認した後も、移行直後は旧URLをすぐ削除せず、イベント受信状況を確認する。

### Google Search Console

1. `playfutarishiru.com` のドメインプロパティを追加・所有権確認する。
2. 新しいsitemap `https://playfutarishiru.com/sitemap.xml` を送信する。
3. 本番の新旧リダイレクト確認後、旧ドメインの「アドレス変更」から新ドメインを指定する。
4. 旧ドメインは少なくとも1年維持し、リダイレクトは少なくとも180日以上維持する。

## 本番確認項目

- `https://playfutarishiru.com/` が200で表示される
- `https://playfutarishiru.com/en` が表示される
- `https://www.playfutarishiru.com/...` が同じパスのapexへ308転送される
- `https://www.kachikanmatch.jp/invite/...?...` が同じパス・クエリの新ドメインへ308転送される
- `https://playfutarishiru.com/robots.txt` が新sitemapを示す
- `https://playfutarishiru.com/sitemap.xml` 内のURLがすべて新ドメインになっている
- 日本語版と英語版で匿名認証、回答、招待、結果表示が成功する
- Stripeテスト決済後、新ドメインの結果画面へ戻る
- Stripe Webhookの直近イベントが2xxになる
