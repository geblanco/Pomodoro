#!/bin/bash

if [[ -d ./dist ]]; then
  rm -rf ./dist
fi

mkdir ./dist && cd ./dist

echo "[Desktop Entry]" > pomodoro.desktop
echo "Encoding=UTF-8" >> pomodoro.desktop
echo "Version=1.0" >> pomodoro.desktop
echo "Name=Pomodoro" >> pomodoro.desktop
echo "Comment=Time efficiency program" >> pomodoro.desktop
echo "Exec=/opt/pomodoro/pomodoro" >> pomodoro.desktop
echo "Terminal=false" >> pomodoro.desktop
echo "Type=Application" >> pomodoro.desktop
echo "Categories=Utility;" >> pomodoro.desktop

# TODO copy icon to icons folder
version=$(node -p "require('../package.json').version")

../node_modules/electron-packager/cli.js ../ pomodoro \
	--platform=linux \
	--arch=x64 \
	--electron-version=$(electron -v | cut -c 2-) \
	--prune \
	--ignore="installDeps.sh" \
	--ignore="mkDist.sh" \
	--ignore="tmpIcons/*" \
	--ignore="Makefile/*" \
	--ignore=".gitignore" \
	--ignore=".git" \
	--version-string.FileDescription="pomodoro" \
	--version-string.FileVersion="$version" \
	--version-string.ProductVersion="$version" \
	--version-string.ProductName="Pomodoro" \
	--app-version="$version" \
	--overwrite

mv pomodoro-linux-x64 pomodoro

cd ..
