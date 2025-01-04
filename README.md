# SQL Query Builder & Interpreter

Este projeto automatiza o trabalho com queries SQL parametrizadas, facilitando o entendimento e o processo de análise.

## Funcionalidades

- **Montagem Automática:** Combina parâmetros separados em uma query SQL completa.
- **Exibição de Parâmetros:** Mostra os nomes e valores dos parâmetros preenchidos.
- **Interpretação:** Traduz a query para uma linguagem simples e explicativa.

## Objetivo

Simplificar a criação, visualização e interpretação de queries SQL, ajudando desenvolvedores a trabalharem de forma mais eficiente.

## Como Usar

1. Insira uma query SQL com parâmetros e os respectivos valores.
   > SELECT \* FROM tabela WHERE coluna = ?
   > Params:
   > 1 = valor
2. O sistema combina automaticamente os parâmetros na query e a formata.
   > SELECT \*
   > FROM tabela
   > WHERE coluna = 'valor'
3. Visualize os parâmetros preenchidos e suas explicações.
   > coluna | 'valor'
4. Receba uma interpretação clara do que a query faz.
   > "Selecione todos os registros da tabela onde a coluna é igual a 'valor'."

## Tecnologias Utilizadas

- TypeScript
- Next.js, Shadcn, Tailwind CSS
