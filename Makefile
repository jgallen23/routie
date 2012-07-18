build:
	@git checkout master README.md
	@node node_modules/.bin/markx-project --title "Routie | Javascript hash router" --user jgallen23 --repo routie README.md 

install:
	@npm install markx-project

preview: build
	@python -m SimpleHTTPServer


.PHONY: preview install
