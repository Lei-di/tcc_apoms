# Atualização automática e concorrência

O frontend mantém uma única requisição autenticada a `GET /atualizacoes` por aba, compartilhada pelas telas e pelo menu de notificações. O servidor responde quando uma escrita HTTP termina com sucesso. A tela busca os dados novamente pelas rotas existentes, mantendo as permissões dessas rotas. O aviso transmite apenas uma revisão opaca, sem registros ou dados pessoais.

A espera termina também após 25 segundos para recuperar mudanças perdidas, mudanças diretas no banco e alterações feitas por outra instância do backend. Ao recuperar foco ou conexão, a aba busca os dados novamente. Falhas de rede iniciam novas tentativas a cada 5 segundos e exibem um aviso; uma sessão expirada exige novo login. O proxy de produção deve permitir requisições com duração superior a 25 segundos.

O aviso imediato é local ao processo Node. Com múltiplas instâncias, mudanças de outra instância chegam na atualização periódica, em até aproximadamente 25 segundos mais o tempo das consultas. Para avisos imediatos entre instâncias, usar um canal compartilhado, como PostgreSQL LISTEN/NOTIFY ou Redis.

As listagens de ofertas e solicitações de inclusão retornam `versao`, derivada de `xmin` do PostgreSQL. Ela é um token opaco de concorrência, não uma data, sequência de negócio ou identificador permanente. Editar, excluir, avaliar e responder contraoferta exigem a versão vista pelo usuário. A condição SQL verifica essa versão junto com proprietário/status; avaliações mantêm o bloqueio `FOR UPDATE` e a transação. Versão ausente retorna 428; registro alterado, removido ou já processado retorna 409, sem confirmar a ação.

Se uma oferta aberta mudar, o formulário de avaliação/edição é fechado com um aviso para revisar os dados. Atualizações que não mudam essa oferta preservam o preenchimento. A edição do perfil preserva seu rascunho; o controle de versão nesta implementação cobre ofertas e solicitações de inclusão, não todos os cadastros do sistema.

Reinicie o backend e disponibilize o novo frontend juntos. Abas com a versão antiga do frontend precisam ser recarregadas uma vez, pois não enviam o token de concorrência. Não há dependências novas nem migração de tabelas.

## Verificação

Execute `npm test` no backend e `npm run build` / `npm run lint` no frontend. Os testes automatizados verificam avisos, reconexão, validação de versão e caminhos de conflito dos controladores com banco simulado. Não substituem um teste integrado com PostgreSQL.

Para validar com duas sessões: abra uma oferta pendente no administrador; edite ou exclua a mesma oferta como produtor. A lista deve atualizar e a avaliação aberta deve fechar com aviso. Se o administrador clicar em confirmar antes de receber a atualização, a versão antiga deve ser recusada. Repita com dois administradores avaliando a mesma oferta: apenas a primeira avaliação pode concluir. Confirme também que mudanças em outra oferta não apagam o texto em preenchimento.
