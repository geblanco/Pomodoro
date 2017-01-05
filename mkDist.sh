#!/bin/bash

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

electron-packager ./ pomodoro \
	--platform=linux \
	--arch=x64 \
	--version=$(electron -v | cut -c 2-) \
	--prune \
	--ignore="mkDist.sh" \
	--ignore="tmpIcons/*" \
	--ignore=".gitignore" \
	--ignore=".git" \
	--version-string.FileDescription="pomodoro" \
	--version-string.FileVersion="0.1.0" \
	--version-string.ProductVersion="0.1.0" \
	--version-string.ProductName="pomodoro" \
	--app-version="0.1.0" \
	--overwrite

mv pomodoro-linux-x64 pomodoro