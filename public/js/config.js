// =====================================================================
//  CONFIGURAÇÃO DO TECLANINJA
//  Siga o passo a passo do arquivo LEIA-ME.md para preencher estes dados.
//  Enquanto o firebaseConfig não for preenchido, o site funciona em
//  "modo demonstração" (dados salvos apenas no navegador).
// =====================================================================

// 1) Cole aqui a configuração do seu app Web do Firebase
export const firebaseConfig = {
  apiKey: "AIzaSyA23bFLMol-6c15spR-8PqD1rcPaW_F63E",
  authDomain: "teclaninja-escola.firebaseapp.com",
  projectId: "teclaninja-escola",
  storageBucket: "teclaninja-escola.firebasestorage.app",
  messagingSenderId: "203116530041",
  appId: "1:203116530041:web:35227544f0cbbfe52507a8"
};

// 2) Contas Google que podem acessar o Painel do Professor.
//    (Lembre-se de colocar os mesmos e-mails no arquivo firestore.rules.)
export const PROFESSORES = [
  "paulo15356@go.docente.senai.br"
];

// 3) Opcional: aceitar apenas contas Google de um domínio da escola.
//    Exemplo: "aluno.senai.br". Deixe "" para aceitar qualquer conta Google.
export const DOMINIO_ALUNOS = "";
