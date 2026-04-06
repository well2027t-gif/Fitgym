# Validação de publicação do Fitgym

Foi identificado que a publicação do site no GitHub Pages usa o diretório `docs/` na raiz do repositório.

O arquivo `fitpro-app/vite.config.ts` confirma que a build de produção usa `base: '/Fitgym/'` e grava a saída em `../docs`.

A nova build já foi gerada localmente com sucesso e os arquivos atualizados de `docs/` já foram enviados para a branch `main`.

Próximo passo de validação: abrir a área de **Profissionais** no site publicado e verificar se a interface nova de profissionais e chat já está refletida na versão hospedada.
