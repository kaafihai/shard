# Shard

## Development

```shell
nix develop
pnpm run tauri dev
```

## Building for Android

### Setup (one-time)

```shell
keytool -genkey -v -keystore ./src-tauri/gen/android/local-keystore.jks -keyalg RSA -keysize 2048 -validity 10000 -alias upload
# answer the prompts to generate the key

cp src-tauri/gen/android/key.properties{.sample,}

# edit the password & keyAlias fields here:
$EDITOR src-tauri/gen/android/key.properties
```


### Building

pnpm run tauri android build
```
```
