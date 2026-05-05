.PHONY: postgres postgres-stop postgres-clean

DATA=./data

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

