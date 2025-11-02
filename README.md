# 🚀 Focus Flow: Aplicativo de Lista de Tarefas (To-Do List)

![Status: Em Desenvolvimento](https://img.shields.io/badge/status-em_desenvolvimento-yellow)

Este é um projeto de aplicativo móvel para gerenciamento de tarefas (To-Do List), desenvolvido como parte de um trabalho em grupo. O **Focus Flow** foi criado para ajudar usuários a organizar suas atividades diárias com um design limpo, moderno e focado na produtividade.

## ✨ Funcionalidades Principais

* **Autenticação de Usuário:** Telas de Login e Cadastro com gerenciamento de estado de autenticação (usando React Context).
* **Gerenciamento de Tarefas (CRUD):** Crie, leia, atualize e delete tarefas.
* **Criação Rápida:** Um modal "Quick Add" (como o do wireframe) que aparece acima do teclado para adicionar tarefas rapidamente sem sair da tela principal.
* **Ações de Deslizar (Swipe):** Arraste uma tarefa para o lado para acessar as opções de **Editar**, **Excluir** e **Favoritar**.
* **Navegação Completa:**
    * **Menu de Abas (Tab Navigation):** Para alternar facilmente entre as telas de Tarefas, Calendário e Perfil.
    * **Menu Lateral (Drawer):** Acessível pelo ícone "menu", permite filtrar tarefas por categoria (Trabalho, Pessoal, etc.) e realizar Logout de forma segura.
* **Formulário Detalhado:** Tela de "Adicionar/Editar Tarefa" com seletores de data, hora e categoria.

---

## 💻 Tecnologias Utilizadas

* **[React Native](https://reactnative.dev/) (com [Expo](https://expo.dev/)):** Framework principal para desenvolvimento mobile multiplataforma.
* **[React Navigation](https://reactnavigation.org/):** Para todo o gerenciamento de navegação, incluindo:
    * Stack Navigator (para o fluxo de autenticação e edição).
    * Tab Navigator (para a barra de navegação inferior).
    * Drawer Navigator (para o menu lateral de filtros).
* **`react-native-swipe-list-view`:** Biblioteca utilizada para implementar as ações de deslizar (swipe) nas tarefas.
* **`uuid`:** Para a geração de IDs únicos para as tarefas criadas localmente.
* **Componentes Nativos:** Uso de `@react-native-community/datetimepicker` e `@react-native-picker/picker` para os formulários.

---

## 🚀 Como Executar o Projeto

1.  **Clone o repositório:**
    ```bash
    git clone https://github.com/Tiago1227/FocusFlow
    ```

2.  **Entre na pasta do projeto:**
    ```bash
    cd FocusFlow
    ```

3.  **Instale as dependências:**
    *(Certifique-se de que o `package.json` está presente)*
    ```bash
    npm install
    ```

4.  **Execute o projeto (com Expo):**
    ```bash
    npx expo start
    ```

5.  **Abra no seu celular:**
    * Baixe o aplicativo **Expo Go** (Android ou iOS).
    * Escaneie o QR Code que apareceu no terminal.

---

## 👥 Equipe do Projeto

Este projeto foi desenvolvido pelo seguinte grupo:

* Ana Julia
* Ana Luiza
* Bruno Maciel
* Giovanna Ribeiro
* Tiago Cardoso
* Victoria Gonçalves
