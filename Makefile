.PHONY: postgres postgres-stop postgres-clean

DATA=./data
BUN=~/.bun/bin/bun
BACKEND=backend

$(DATA):
	mkdir -p $(DATA)

up: $(DATA)
	podman-compose up -d
	python3 -m venv venv
	source venv/bin/activate && pip install -r requirements.txt

down:
	podman-compose down

reset:
	podman-compose down -v
	-podman unshare rm -rf data/postgres
	rm -rf data
	rm -rf venv

seed:
	export $(grep -v '^#' .env | xargs)
	source venv/bin/activate && python3 seed.py

re: reset up
	sleep 4
	make -sC . seed

$(BUN):
	curl -fsSL https://bun.com/install | bash

cert:
	mkdir -p $(BACKEND)/ssl
	cd $(BACKEND)/ssl && openssl req -x509 -nodes -days 365 -newkey rsa:4096 -keyout key.pem -out cert.pem -config cert.cnf

start: $(BUN)
	cd $(BACKEND) && npm run dev