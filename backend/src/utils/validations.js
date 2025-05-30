// src/utils/validations.js
// Validações completas para o sistema

const { body } = require('express-validator');

// ===============================================
// VALIDAÇÕES PARA REGISTRO DE USUÁRIO
// ===============================================

const validateRegister = [
  body('nome')
    .trim()
    .notEmpty()
    .withMessage('Nome é obrigatório')
    .isLength({ min: 2, max: 100 })
    .withMessage('Nome deve ter entre 2 e 100 caracteres')
    .matches(/^[a-zA-ZÀ-ÿ\s]+$/)
    .withMessage('Nome deve conter apenas letras e espaços'),

  body('email')
    .trim()
    .notEmpty()
    .withMessage('Email é obrigatório')
    .isEmail()
    .withMessage('Email deve ter um formato válido')
    .normalizeEmail()
    .isLength({ max: 255 })
    .withMessage('Email muito longo'),

  body('senha')
    .notEmpty()
    .withMessage('Senha é obrigatória')
    .isLength({ min: 6, max: 100 })
    .withMessage('Senha deve ter entre 6 e 100 caracteres')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Senha deve conter pelo menos: 1 letra minúscula, 1 maiúscula e 1 número'),

  body('confirmarSenha')
    .notEmpty()
    .withMessage('Confirmação de senha é obrigatória')
    .custom((value, { req }) => {
      if (value !== req.body.senha) {
        throw new Error('Confirmação de senha não confere');
      }
      return true;
    })
];

// ===============================================
// VALIDAÇÕES PARA LOGIN
// ===============================================

const validateLogin = [
  body('email')
    .trim()
    .notEmpty()
    .withMessage('Email é obrigatório')
    .isEmail()
    .withMessage('Email deve ter um formato válido')
    .normalizeEmail(),

  body('senha')
    .notEmpty()
    .withMessage('Senha é obrigatória')
    .isLength({ min: 1 })
    .withMessage('Senha não pode estar vazia')
];

// ===============================================
// VALIDAÇÕES PARA ATUALIZAR PERFIL
// ===============================================

const validateUpdateProfile = [
  body('nome')
    .trim()
    .notEmpty()
    .withMessage('Nome é obrigatório')
    .isLength({ min: 2, max: 100 })
    .withMessage('Nome deve ter entre 2 e 100 caracteres')
    .matches(/^[a-zA-ZÀ-ÿ\s]+$/)
    .withMessage('Nome deve conter apenas letras e espaços')
];

// ===============================================
// VALIDAÇÕES PARA ALTERAR SENHA
// ===============================================

const validateChangePassword = [
  body('senhaAtual')
    .notEmpty()
    .withMessage('Senha atual é obrigatória'),

  body('novaSenha')
    .notEmpty()
    .withMessage('Nova senha é obrigatória')
    .isLength({ min: 6, max: 100 })
    .withMessage('Nova senha deve ter entre 6 e 100 caracteres')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Nova senha deve conter pelo menos: 1 letra minúscula, 1 maiúscula e 1 número'),

  body('confirmarNovaSenha')
    .notEmpty()
    .withMessage('Confirmação da nova senha é obrigatória')
    .custom((value, { req }) => {
      if (value !== req.body.novaSenha) {
        throw new Error('Confirmação da nova senha não confere');
      }
      return true;
    })
];

// ===============================================
// VALIDAÇÕES PARA EMPRESAS
// ===============================================

const validateCreateEmpresa = [
  body('nome')
    .trim()
    .notEmpty()
    .withMessage('Nome da empresa é obrigatório')
    .isLength({ min: 2, max: 100 })
    .withMessage('Nome deve ter entre 2 e 100 caracteres'),

  body('tipo_pessoa')
    .notEmpty()
    .withMessage('Tipo de pessoa é obrigatório')
    .isIn(['PF', 'PJ'])
    .withMessage('Tipo de pessoa deve ser PF ou PJ'),

  body('cnpj_cpf')
    .optional()
    .trim()
    .custom((value, { req }) => {
      if (!value) return true; // Campo opcional

      // Remove formatação
      const numeros = value.replace(/\D/g, '');

      if (req.body.tipo_pessoa === 'PJ') {
        // Validar CNPJ (14 dígitos)
        if (numeros.length !== 14) {
          throw new Error('CNPJ deve ter exatamente 14 dígitos');
        }
      } else if (req.body.tipo_pessoa === 'PF') {
        // Validar CPF (11 dígitos)
        if (numeros.length !== 11) {
          throw new Error('CPF deve ter exatamente 11 dígitos');
        }
      }
      return true;
    }),

  body('ramo_atividade')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Ramo de atividade deve ter no máximo 100 caracteres')
];

const validateUpdateEmpresa = [
  body('nome')
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Nome deve ter entre 2 e 100 caracteres'),

  body('tipo_pessoa')
    .optional()
    .isIn(['PF', 'PJ'])
    .withMessage('Tipo de pessoa deve ser PF ou PJ'),

  body('cnpj_cpf')
    .optional()
    .trim()
    .custom((value, { req }) => {
      if (!value) return true;
      const numeros = value.replace(/\D/g, '');
      if (req.body.tipo_pessoa === 'PJ' && numeros.length !== 14) {
        throw new Error('CNPJ deve ter exatamente 14 dígitos');
      }
      if (req.body.tipo_pessoa === 'PF' && numeros.length !== 11) {
        throw new Error('CPF deve ter exatamente 11 dígitos');
      }
      return true;
    }),

  body('ramo_atividade')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Ramo de atividade deve ter no máximo 100 caracteres')
];

const validateToggleEmpresa = [
  body('ativa')
    .notEmpty()
    .withMessage('Campo "ativa" é obrigatório')
    .isBoolean()
    .withMessage('Campo "ativa" deve ser true ou false')
];

// ===============================================
// VALIDAÇÕES PARA PREMISSAS
// ===============================================

const validateCreatePremissa = [
  body('empresa_id')
    .notEmpty()
    .withMessage('ID da empresa é obrigatório')
    .isInt({ min: 1 })
    .withMessage('ID da empresa deve ser um número positivo'),

  body('ano')
    .notEmpty()
    .withMessage('Ano é obrigatório')
    .isInt({ min: 2020, max: 2030 })
    .withMessage('Ano deve estar entre 2020 e 2030'),

  body('receita_anual')
    .notEmpty()
    .withMessage('Receita anual é obrigatória')
    .isFloat({ min: 0 })
    .withMessage('Receita anual deve ser um valor positivo')
    .custom((value) => {
      if (parseFloat(value) > 999999999.99) {
        throw new Error('Receita anual não pode exceder R$ 999.999.999,99');
      }
      return true;
    }),

  body('crescimento_mensal')
    .optional()
    .isFloat({ min: -50, max: 50 })
    .withMessage('Crescimento mensal deve estar entre -50% e 50%'),

  body('sazonalidade')
    .optional()
    .isObject()
    .withMessage('Sazonalidade deve ser um objeto')
    .custom((value) => {
      if (!value) return true;
      const mesesValidos = [
        'janeiro', 'fevereiro', 'marco', 'abril', 'maio', 'junho',
        'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro'
      ];
      for (const mes in value) {
        if (!mesesValidos.includes(mes)) {
          throw new Error(`Mês "${mes}" não é válido`);
        }
        const percentual = parseFloat(value[mes]);
        if (isNaN(percentual) || percentual < 0 || percentual > 50) {
          throw new Error(`Percentual do mês ${mes} deve estar entre 0% e 50%`);
        }
      }
      return true;
    })
];

const validateUpdatePremissa = [
  body('receita_anual')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Receita anual deve ser um valor positivo')
    .custom((value) => {
      if (value && parseFloat(value) > 999999999.99) {
        throw new Error('Receita anual não pode exceder R$ 999.999.999,99');
      }
      return true;
    }),

  body('crescimento_mensal')
    .optional()
    .isFloat({ min: -50, max: 50 })
    .withMessage('Crescimento mensal deve estar entre -50% e 50%'),

  body('sazonalidade')
    .optional()
    .isObject()
    .withMessage('Sazonalidade deve ser um objeto')
    .custom((value) => {
      if (!value) return true;
      const mesesValidos = [
        'janeiro', 'fevereiro', 'marco', 'abril', 'maio', 'junho',
        'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro'
      ];
      for (const mes in value) {
        if (!mesesValidos.includes(mes)) {
          throw new Error(`Mês "${mes}" não é válido`);
        }
        const percentual = parseFloat(value[mes]);
        if (isNaN(percentual) || percentual < 0 || percentual > 50) {
          throw new Error(`Percentual do mês ${mes} deve estar entre 0% e 50%`);
        }
      }
      return true;
    })
];

// ===============================================
// EXPORTAR TODAS AS VALIDAÇÕES
// ===============================================

module.exports = {
  validateRegister,
  validateLogin,
  validateUpdateProfile,
  validateChangePassword,
  validateCreateEmpresa,
  validateUpdateEmpresa,
  validateToggleEmpresa,
  validateCreatePremissa,
  validateUpdatePremissa
};