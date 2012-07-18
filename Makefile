

build: 
	./node_modules/.bin/smoosh make ./build.json

install:
	npm install mocha
	npm install chai
	npm install smoosh

test:
	python -m SimpleHTTPServer

.PHONY: install test
