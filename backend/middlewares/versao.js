function exigirVersao(req, res, next) {
  if (typeof req.body?.versao !== 'string' || !/^\d+$/.test(req.body.versao)) {
    return res.status(428).json({
      mensagem: 'Reabra a solicitação para carregar a versão atual antes de salvar.',
    })
  }
  next()
}

module.exports = { exigirVersao }
