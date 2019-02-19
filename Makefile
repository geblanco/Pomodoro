INSTALL = install
LINK = ln -s
COPY = cp -r

DESTDIR ?= /
FULL_DIR ?= $(DESTDIR)/opt

PATH_PREFIX ?= $(DESTDIR)/usr
PATH_EXEC = $(PATH_PREFIX)/bin/pomodoro
PATH_EXEC_DESKTOP = $(PATH_PREFIX)/share/applications/pomodoro.desktop

#
# Targets
#

build:
	./installDeps.sh
	./mkDist.sh

install:
	$(INSTALL) -m0644 -D dist/pomodoro.desktop $(PATH_EXEC_DESKTOP)
	$(COPY) dist/pomodoro $(FULL_DIR)
	$(LINK) $(FULL_DIR)/pomodoro/pomodoro $(PATH_EXEC)

uninstall:
	rm -f $(PATH_EXEC)
	rm -f $(PATH_EXEC_DESKTOP)


.PHONY: build install uninstall
