#!/bin/sh

# Aborta o script se qualquer comando falhar
set -e

# Espera até que o hostname 'backend' possa ser resolvido e a porta 8000 esteja aberta
until nc -z -v backend 8000; do
  >&2 echo "Backend ainda não está disponível na rede - aguardando..."
  sleep 1
done

>&2 echo "Backend está disponível! Iniciando o servidor frontend..."

# Executa o comando original do contêiner (o CMD do Dockerfile)
exec "$@"