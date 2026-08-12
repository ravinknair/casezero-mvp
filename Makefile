APP_DIR := casezero-mvp
NPM := npm --prefix $(APP_DIR)

.PHONY: install dev build test lint check ci

install:
	npm --prefix $(APP_DIR) install

dev:
	$(NPM) run dev

build:
	$(NPM) run build

test:
	$(NPM) run test

lint:
	$(NPM) run lint

check:
	$(NPM) run check

ci:
	$(NPM) run ci
