# run this script with `npm run vendor-electron`, so CWD will be the project root

# remove electron if it already exists
[ -e vendor/electron ] && rm -rf vendor/electron

# start anew
mkdir -p vendor/electron

# download latest electron and put it in vendor/electron
curl -L https://github.com/electron/electron/archive/master.tar.gz | tar -xz --strip-components=1 -C vendor/electron
