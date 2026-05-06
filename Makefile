.PHONY: postgres postgres-stop postgres-clean

DATA=./data
BUN=~/.bun/bin/bun
BACKEND=backend

$(DATA):
	mkdir -p $(DATA)

up: $(DATA)
	podman-compose up -d

down:
	podman-compose down

reset:
	podman-compose down -v
	podman unshare rm -rf data/postgres
	rm -rf data

seed:
	export $(grep -v '^#' .env | xargs)
	./seed.sh

re: reset up
	sleep 2
	make -sC . seed

$(BUN):
	curl -fsSL https://bun.com/install | bash



start: $(BUN)
	cd $(BACKEND) && npm run dev