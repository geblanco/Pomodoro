# Pomodoro
Custom Pomodoro implementation done with electron ( [atom shell](http://electron.atom.io/) )

## Installation
```
// Clone the repo
git clone ...
cd pomodoro

// Install modules
sudo npm i

// Make the package
chmod a+x ./mkDist.sh
./mkDist.sh

// Copy files wherever you want
// For example in /opt (.desktop file defaults there, change it if you want another location)
sudo cp -r pomodoro /opt/pomodoro
sudo cp pomodoro.desktop /usr/share/applications/
```

## Wanted Features
* Block DNS (avoid visiting certain webpages: twitter, facebook...)