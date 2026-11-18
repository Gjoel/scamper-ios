# Scamper for iPhone

Scamper teaches Latin American Spanish with Scamper the dog: 8 South American countries, 400 levels and mini games. This repository turns the Scamper web app into a real iPhone app using [Capacitor](https://capacitorjs.com), and builds it on a free GitHub cloud Mac, so **no Mac is needed**.

- `web/index.html`: the Scamper app (the same file as the website)
- `tools/build-web.js`: turns it into the iPhone version (bundled fonts, the iPhone's Spanish voice, no website bits)
- `ios/`: the Xcode project
- `.github/workflows/ios.yml`: the cloud build that sends the app to TestFlight
- `STORE.md`: text for the App Store listing
- `docs/privacy.html`: the privacy policy page

## One-time setup (about 30 minutes, works on a PC)

### 1. Join the Apple Developer Program
Sign up at https://developer.apple.com/programs/enroll (or in the **Apple Developer** app on iPhone) as an **Individual**. It costs A$149 / US$99 a year. Approval usually takes a day or two.

When you're in, find your **Team ID**: https://developer.apple.com/account → **Membership details** → **Team ID** (10 letters and numbers).

### 2. Register the app's ID
https://developer.apple.com/account/resources/identifiers/list → **+** → **App IDs** → **App** → Continue.
- Description: `Scamper`
- Bundle ID: **Explicit**, `com.gjoel.scamper`
- Continue → Register.

### 3. Create the app in App Store Connect
https://appstoreconnect.apple.com → **Apps** → **+** → **New App**:
- Platform: **iOS**
- Name: `Scamper: Learn Spanish` (if it's taken, try `Scamper Spanish`)
- Primary language: English (Australia)
- Bundle ID: `com.gjoel.scamper`
- SKU: `scamper001`
- User access: Full Access

### 4. Make a key for the cloud builds
App Store Connect → **Users and Access** → **Integrations** tab → **App Store Connect API** → **Team Keys**. (The first time, click **Request Access** and accept.)
- Click **+** (Generate API Key). Name: `GitHub builds`. Access: **Admin**. Click **Generate**.
- Copy the **Issuer ID** (shown above the list) and the key's **Key ID**.
- Click **Download** next to the key. **You can only download it once**, so keep the `.p8` file safe.

Then add 4 secrets to this repository: GitHub → **Settings** → **Secrets and variables** → **Actions** → **New repository secret**:

| Name | Value |
|---|---|
| `APPLE_TEAM_ID` | your Team ID from step 1 |
| `ASC_KEY_ID` | the Key ID |
| `ASC_ISSUER_ID` | the Issuer ID |
| `ASC_KEY_P8` | open the `.p8` file in Notepad and paste **everything**, including the `-----BEGIN PRIVATE KEY-----` and `-----END PRIVATE KEY-----` lines |

Secrets are never shown to anyone, even in a public repository.

### 5. Turn on the privacy policy page
GitHub → **Settings** → **Pages** → Source: **Deploy from a branch**, Branch: **main**, folder **/docs** → Save. The page appears at https://gjoel.github.io/scamper-ios/privacy.html

## Build the app and put it on your iPhone

1. GitHub → **Actions** tab → **iPhone app** → **Run workflow** → **Run workflow**. It takes about 10 to 15 minutes.
2. When it's green, Apple processes the build for 5 to 30 minutes.
3. On your iPhone, install **TestFlight** from the App Store.
4. App Store Connect → your app → **TestFlight** → **Internal Testing** → **+** → create a group, add yourself (your Apple ID email), and add the build.
5. Open the email or TestFlight on your iPhone and tap **Install**. Scamper is now a real app on your phone.

## Release it on the App Store
App Store Connect → your app → **App Store** tab: fill in the text from `STORE.md`, add screenshots, choose the build, set **App Privacy** to **Data Not Collected**, and click **Add for Review** → **Submit for Review**. Apple usually reviews within 1 to 3 days.

## Updating the app
Change `web/index.html` (or ask Claude to), then run the workflow again. Each run gets a new build number automatically.
