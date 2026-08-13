APP_DIR := casezero-mvp
NPM := npm --prefix $(APP_DIR)
DEPLOY_DIR := $(APP_DIR)/dist/server

.PHONY: install dev build test lint check ci deploy

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

deploy: build
	cd $(DEPLOY_DIR) && npx wrangler deploy --config wrangler.json
