# Colinha Estudantil: Plataforma de Estudo e Organização de Arquivos

## Objetivo

A aplicação que será desenvolvida tem como objetivo fornecer uma plataforma de gestão e estudo de materiais digitais de diferentes formatos, focando na organização de materiais como livros, anotações e exercícios. Os usuários poderão fazer upload de seus arquivos, categorizá-los por módulos e acessar conteúdos de forma intuitiva. Entre as principais funcionalidades, a plataforma permitirá o upload de arquivos de diferentes formatos, divisão dos arquivos em módulos, marcação de arquivos com tags e filtragem dos arquivos submetidos. Além disso, será possível adicionar bookmarks em páginas de interesse em PDFs, fazer anotações e destacar trechos importantes nos documentos. A plataforma contará com um sistema de revisão baseado em flashcards, permitindo que os usuários criem resumos a partir das anotações feitas. Para facilitar a organização, os usuários poderão pesquisar rapidamente termos dentro dos materias e contar com filtros avançados para identificar conteúdos anotados. Os materiais poderão ser compartilhados com outras pessoas, tornando a plataforma um ambiente colaborativo para estudo. Além disso, haverá a possibilidade de criar grupos de estudo, onde usuários poderão trocar arquivos, discutir conteúdos e compartilhar anotações de forma estruturada, enriquecendo ainda mais a experiência de aprendizado.

## Membros da Equipe

- Lucas André dos Santos (2022093032) [ FrontEnd ] @lucasandreds 
- Mateus Vitor Mota Vasconcelos (2022043280) [ Fullstack ] @mateusvmv
- Pedro loures Alzamora (2020006949) [ BackEnd ] @pedro-loures
- Rainer Menezes Vieira Silva (2017068785) [ Fullstack ] @RainerM10

## Tecnologias utilizadas

- Linguagem: JavaScript
- Frameworks: Express.js e Pico.css
- Bibliotecas importantes: Handlebars e HTMX
- Banco de dados: SQLite

## Backlog do Produto

- [x] Como usuário, eu gostaria de gerenciar arquivos
- [x] Como usuário, eu gostaria de criar anotações e artigos
- [x] Como usuário, eu gostaria de criar exercícios e revisões
- [x] Como usuário, eu gostaria de ter uma conta pessoal
- [ ] Como usuário, eu gostaria de categorizar os documentos e buscar por categoria
- [ ] Como usuário, eu gostaria de ver arquivos em diferentes formatos
- [ ] Como usuário, eu gostaria de adicionar bookmarks e destacar trechos
- [ ] Como usuário, eu gostaria de fazer buscas com vários filtros
- [ ] Como usuário, eu gostaria de fazer buscas no conteúdo dos documentos
- [ ] Como usuário, eu gostaria de compartilhar meus documentos
- [ ] Como usuário, eu gostaria de fazer grupos de estudo com discussões

## Primeira Sprint

### Iniciais
A configuração inicial do projeto
- [x] Criar o projeto node, instalar as libs sqlite3, express, handlebars, configurar typescript (Mateus)
- [x] Criar um layout inicial em HTML com as libs (Mateus)
- [x] Criar uma página inicial usando o layout (Mateus)
- [x] Criar um backend inicial com código para migrações do banco de dados (Mateus)

### [#1 Como usuário, eu gostaria de gerenciar arquivos](https://github.com/lucasandreds/Trabalho_Engenharia_Software/issues/1)
O usuário deve poder gerenciar arquivos, fazer upload, vê-los, baixar e removê-los.
- [x] Exibir arquivos do usuário na página principal (Lucas)
- [x] Criar uma página para upload de arquivo (Lucas)
- [x] Criar um endpoint para upload de arquivo (Lucas)
- [x] Criar uma página para edição de arquivo (Lucas)
- [x] Criar um endpoint para edição de arquivo (Lucas)
- [x] Criar um endpoint para remoção de arquivo (Lucas)

### [#2 Como usuário, eu gostaria de criar anotações e artigos](https://github.com/lucasandreds/Trabalho_Engenharia_Software/issues/4)
O usuário deve poder criar anotações, editá-las e removê-las.
- [x] Exibir anotações do usuário na página principal (Rainer)
- [x] Criar uma página para criação de anotação (Rainer)
- [x] Criar um endpoint para criação de anotação (Rainer)
- [x] Criar uma página para edição de anotação (Rainer)
- [x] Criar um endpoint para edição de anotação (Rainer)
- [x] Criar um endpoint para remoção de anotação (Rainer)

### [#3 Como usuário, eu gostaria de criar exercícios e revisões](https://github.com/lucasandreds/Trabalho_Engenharia_Software/issues/3)
O usuário deve poder criar e fazer exercícios, editá-los e removê-los.
- [x] Exibir exercícios do usuário na página principal (Mateus)
- [x] Criar uma página para criação de exercício (Mateus)
- [x] Criar um endpoint para criação de exercício (Mateus)
- [x] Criar uma página para edição de exercício (Mateus)
- [x] Criar um endpoint para edição de exercício (Mateus)
- [x] Criar uma página para realização de exercício (Mateus)
- [x] Criar uma página para resultado de exercício (Mateus)
- [x] Criar um endpoint para resultado de exercício (Mateus)
- [x] Criar um endpoint para remoção de exercício (Mateus)

### [#4 Como usuário, eu gostaria de ter uma conta pessoal](https://github.com/lucasandreds/Trabalho_Engenharia_Software/issues/2)
O usuário deve poder se identificar para ver seus documentos.
- [x] Atribuir um cookie de sessão para cada usuário que acessar o site (Pedro)
- [x] Associar sessões a usuários (Pedro)
- [x] Criar uma página de login (Pedro)
- [x] Criar um endpoint de login (Pedro)
- [x] Criar uma página de registro (Pedro)
- [x] Criar um endpoint de registro (Pedro)
- [x] Criar um endpoint de logout (Pedro)

## Diagramas UML:

### Diagrama de sequência de adicionar arquivos:

[![](https://mermaid.ink/svg/pako:eNqVVNuO2jAQ_RXLEoJK4ZIAufhhpVK6b1vx0laqIlVuMoBV4qSOs-w2yr_vOFwCJIvaPM1Mzpy5u6RRGgNlNJS9XkmEFJqRkoRUbyGBkDIUY65-h5RUpOr1QhnKHP4UICNYCr5RPAklwS_jSotIZFxq8nG1ahs_v2QK8rz946nYaVAdLAXmIFHlWqSy_f9R7KBtXS7atm8C9uGRgUdaPHMNTZIoDB8ejukxkqW5HvTHXEVb8QzjItulPO5_uPG-quaoIMuhFkZyITc7GPTXmGPL97Lggzy8TODwI4ZOfBPquj2M7IXefs1BDW7DdfXx2tbBlvDXX_D9fygvEv6HiHcLvsaS28rPjhpHpbDTA9PmLzwBq1_otX9_WBdx3hmiWSxGIgWIaahJrlMF8U9ZKwW2xUi3oZqlNBKSLRcMrwrR2hhquluf08ouF8Nz9FauJ1BNe7d7TQpNSeYCGFEgY5xmv74NvsvH9XpaRML-sSOvw9kYk5HuB22wp6BmqVarDuh706gPklp0o0RMmVYFWDQBlXCj0tLgO56lUFbog2f-I02Tk5tKi82WsjXWiFqRxch_fK3OkLoXn9JCasrswKs5KCvpC2UzZxQE05lruxPf913Psegrgqb-yLE9251O_Hkw9eaVRf_WQSejwJ_aHgJnTuA7bjC3KMQC9-Xp8LjWb2z1BijQy3Y)](https://mermaid.live/edit#pako:eNqVVNuOmzAQ_RXLUpRUIrd1yIIfVmqa7ttWeWkrVUiVC5PEajDUmM1uUf59x5CEBNio5WlmmDlnri5omERAOQ1Ur1cQqaThpCABNVuIIaAcxUjo3wElB3Lo9QIVqAz-5KBCWEqx0SIOFMEvFdrIUKZCGfJxtWobP7-kGrKs_eMp3xnQHSg55qBQFUYmqv3_Ue6gbV0u2rZvEvbBEUGERj4LA3WSKAwfHo7pcZImmRn0x0KHW_kM4zzdJSLqf2hEX1VzVBClqoWTTKrNDgb9NebYir0suJKHlwlUPyLo9K-prtvDyV6a7dcM9KBJ19XHa1sHWixef8H3_4G8SPgfGG8WfO1LmpWfAw2OSmOnB7bNX0QMTj83a-_2sC543hmiXSxOQg3oU0OTzCQaop-qVHJsi5WaVPVSWgnBlguOV4XexhpKuGbMaWWXi-GZvZXryamEvdm9OoW6JHsBnGhQEU6zX96G2GXjcj0domD_2JFXdTbWZKXbpLXvidQu1WrV4freNMqDpA7daBlRbnQODo1Bx8KqtLD-Hc9SoA4Yg2f-I0niU5hO8s2W8jXWiFqeRoh_fK3O1qoZn5JcGcrnrMSgvKAvlA-njI1m08nMn_ozxlyfeQ59tXbPH7GJ5_uT2b3nTt353cGhf0vi6Yi5rst815_MPXbPvDuHQiRxZ56qB7Z8Zw9vR8PMQA)

### Diagrama de classes:

[![](https://mermaid.ink/svg/pako:eNqVVltv2jAY_SuRpUpbRwuU0kIeJlUr28suXUs3actUuclXsBbs1HaADvHfZzsXbCd0HS_4u_p8xydxNihmCaAQxSkW4pLgGceLiB4cbAJCiQyDTRAhOYcFRChUywTz3xEKtsH24CCiETVlQXIfbCIaqN-bG4mlyqYyyDMBXE7WwGMioBEm9NlwniVquTc8A3lD6Cx9NuMiTauwaMQTSF_S_zOT-3rrkNgzV2tZMVNrSKEBJwRriF-9Lo0FUcciQdvbHesV-Jp7odqROMgwF1DXls4CcovXd8Ucyq2Ml-aLe-ABZyuS1IlcUROwFQV-53spXoDrSUDEnGSSMFoGKuBfcxDa_fPwV_BYritCC65qGAU_tWlGvAaRp7IkpSYjQn0l0KOjt2p1qFb-ZlaqTkrum4RWqRaxZhJJZAp7ZrigYqV4wuZPqIkcVHXHf6Er2uyHVG7jA4O1dM9ridMcHLVobf2PUnIlY32YLYohSbtmDD-dIGZUKk13Ar9Fic2XjE1r6SpbuM6qnZdq9k7usJ9tBGT5S0W5IJv6UpQZqnxxXIOR6Hci57fCOgJjaGimtMh1EhroVZrfTG92K-yDf0_S3XHtIY5xMiMUp3dNVoRkXA3fDLSTmGcpw4nLoqWQBwXmJTp4XjqlShzUHRtpUzHeY6_6a16mT5nj-0ZgdYkltn1XHJaWW3FuGPVPFWdZzfKHyTTo2mvMH3OyZML2gXkgY-J6MWUSx6y-Dq6-3Jj6eE6W0C3YdTsXEU2s6Ib1wV5OPk6mk128mN9KcKqzYsZ9YS_mYhJ42egL5cumS2HlFIF7TbrJ_g52oMvNO9qbrqW00bILCanqrm6n-4uovoUbiKl1N1tpbY3riIfS8pvXqJaKls_um6HyaGXtrOISryzvSY8o6qAZJwkKJc-hgxbAF1ibyMiw5WNLba9qMkx_MLaoyjjLZ3MUPuBUKKt4tZVfb3UK0AT4O5ZTicKT3sD0QOEGrY15PD4_HQ0Hw_7w7GTYQU8oPBscD_qjYW_UPx31x4PB2baD_pg9e8fK3R-PTofn4_N-bzDqIM0i45_Kj0f9t_0LV7ZlqQ)](https://mermaid.live/edit#pako:eNqVVltv0zAY_SuRpUowunVdm9HmAWlihRcuYxeQIGjykm-tRWoH22k3qv53bOdS20nH6Evt7-bzHZ_Y3qCEpYAilGRYiHOC5xwvY9rrbQJCiYyCTRAjuYAlxChSwxTzXzEKtsG214tpTE1akN4Fm5gG6vfqSmKpoqkMilwAl7MH4AkR0HIT-qS7yFM13Oueg7widJ49GXGWZbVbtPwpZM-p_4nJfbW1S-zpqzOt7KnTpdCA44IHSF68rCZLorZFgp5vd6zX4BvuhSpHkiDHXECTWxlLyB1W35RwqJYyVlos74AHnK1J2gRyRU3A1hT4rW-leAmuJQWRcJJLwmjlqIF_KUBo84-Dn8HvalwTWnLVwCj5aaamxUsQRSYrUhoyYjRUAj08fKNGB2rkL2aF6qD0rk1oHWoRazqRRGawp4czKtaKJ2z-hOrIQdVU_Be6ssx-SNUyPjB4kO5-rXBWgKMWra3_UUqhZKw3s0MxJO3WjOGnHySMSqXpfuCXqLD5krFprUxVCddYl_NCzdrpLfajjYAse6UoF2RbX4oyQ5UvjkswEv1G5OJGWFtgJhqaSS1jnYAWehXmF9OL3Qh749-RbLdde4hjnMwJxdltmxUhGVfNtx3dJBZ5xnDqsmgp5F6BeY4OnpZOpRIHdd9G2laM99mr-pqX68fcsX0lsD7HEtu2Cw4ry6w4N4z6u4rzvGH5_ew6GNhjzH8XZMWEbQPzQSbEtWLKJE5Ycx1cfL4y-cmCrGBQsutWLj2aWDGImo09n32YXc92_rJ_K8DJzsse97k9n4tJ4FWrLlSHzYDC2kkC95p0g_0VbMeAmzPa664jtVVyACmp8y5urvcnUX0LtxBT6262wroKNx4PpWU3x6iWipbP7s1QW7SydrPyEq9n3pceU9RHc05SFEleQB8tgS-xniIjw47Hllpe5eSYfmdsWadxVswXKLrHmVCz8mirXm9NCNAU-FtWUImicGpKoGiDHlB0OByNjsbD4_F0OB2PRuF0NOmjR22fTI9Gx5Pp9Hj8ehIOw9OTbR_9MesOj0ZhGI6m4Tgcnw4nJ6d9pJlk_GP1gNR_27_jkmZ-)