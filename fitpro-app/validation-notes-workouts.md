# Validação visual local — sistema de treinos

## Evidências já confirmadas

- A rota local `#/treinos` renderiza corretamente após recarregar a prévia.
- O herói da nova tela de treinos aparece com os cards de **Objetivo**, **Frequência** e **Modo**.
- Os botões de seleção entre **Treino automático** e **Treino manual** estão visíveis.
- O bloco **Perfil usado para treinos** aparece com nível, local, equipamentos e limitações.
- O bloco **Plano automático** está renderizando a divisão **Upper / Lower**.
- A seção **Semana ativa** mostra 4 treinos automáticos com 20 exercícios no total.
- O bloco **Histórico recente** aparece corretamente, ainda vazio, como esperado antes de concluir uma sessão.
- A interface está sofrendo interferência visual da barra inferior do ambiente de pré-visualização, mas o conteúdo funcional da página está presente.

## Observação operacional

- Houve um estado temporário de tela aparentemente vazia na pré-visualização local, mas a navegação direta para `#/treinos` voltou a mostrar todo o conteúdo normalmente. Isso sugere instabilidade visual momentânea da prévia, e não erro fatal de renderização da rota.
