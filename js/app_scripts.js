document.addEventListener('DOMContentLoaded', () => {

    // --- Funções de Máscara ---
    const applyCpfMask = (inputElement) => {
        if (!inputElement) return; // Garante que o elemento existe
        inputElement.addEventListener('input', (e) => {
            let value = e.target.value.replace(/\D/g, ''); // Remove tudo que não é dígito
            let formattedValue = '';

            if (value.length > 0) {
                formattedValue += value.substring(0, 3);
                if (value.length > 3) {
                    formattedValue += '.' + value.substring(3, 6);
                }
                if (value.length > 6) {
                    formattedValue += '.' + value.substring(6, 9);
                }
                if (value.length > 9) {
                    formattedValue += '-' + value.substring(9, 11);
                }
            }
            e.target.value = formattedValue;
        });
    };

    const applyPhoneMask = (inputElement) => {
        if (!inputElement) return; // Garante que o elemento existe
        inputElement.addEventListener('input', (e) => {
            let value = e.target.value.replace(/\D/g, ''); // Remove tudo que não é dígito
            let formattedValue = '';

            if (value.length > 0) {
                formattedValue += '(' + value.substring(0, 2);
                if (value.length > 2) {
                    // Se for celular (9 dígitos depois do DDD, começando com 9)
                    if (value.length > 6 && (value.charAt(2) === '9' || value.charAt(2) === '8' || value.charAt(2) === '7')) { // Adicionado 8 e 7 para flexibilidade
                        formattedValue += ') ' + value.substring(2, 7);
                        if (value.length > 7) {
                            formattedValue += '-' + value.substring(7, 11);
                        }
                    } else { // Fixo ou 8 dígitos
                        formattedValue += ') ' + value.substring(2, 6);
                        if (value.length > 6) {
                            formattedValue += '-' + value.substring(6, 10);
                        }
                    }
                }
            }
            e.target.value = formattedValue;
        });
    };

    // --- Função de Validação de CPF (Básica) ---
    const isValidCPF = (cpf) => {
        cpf = cpf.replace(/\D/g, ''); // Remove caracteres não numéricos
        if (cpf.length !== 11 || /^(\d)\1{10}$/.test(cpf)) return false; // Verifica se tem 11 dígitos e não são todos iguais

        // Validação do primeiro dígito verificador
        let sum = 0;
        let remainder;
        for (let i = 1; i <= 9; i++) sum = sum + parseInt(cpf.substring(i - 1, i)) * (11 - i);
        remainder = (sum * 10) % 11;
        if ((remainder === 10) || (remainder === 11)) remainder = 0;
        if (remainder !== parseInt(cpf.substring(9, 10))) return false;

        // Validação do segundo dígito verificador
        sum = 0;
        for (let i = 1; i <= 10; i++) sum = sum + parseInt(cpf.substring(i - 1, i)) * (12 - i);
        remainder = (sum * 10) % 11;
        if ((remainder === 10) || (remainder === 11)) remainder = 0;
        if (remainder !== parseInt(cpf.substring(10, 11))) return false;

        return true;
    };


    // --- Navegação entre Telas ---

    // Botão "Começar Agora" na Welcome Screen
    const startButton = document.getElementById('startButton');
    if (startButton) {
        startButton.addEventListener('click', () => {
            applyClickEffect(startButton);
            setTimeout(() => {
                // Navegação ajustada para GitHub Pages
                window.location.href = 'screen_auth.html';
            }, 300); // Pequeno atraso para efeito de clique
        });
    }

    // Botão "Já Autorizei" na Auth Screen
    const authButton = document.getElementById('authButton');
    if (authButton) {
        authButton.addEventListener('click', () => {
            applyClickEffect(authButton);
            setTimeout(() => {
                // Navegação ajustada para GitHub Pages
                window.location.href = 'screen_simulation.html';
            }, 300); // Pequeno atraso para efeito de clique
        });
    }

    // --- Lógica da Simulação (Simulation Screen) ---
    const simulateCpfButton = document.getElementById('simulateCpfButton');
    const cpfSimulationInput = document.getElementById('cpfSimulation');
    const cpfSimulationFeedback = document.getElementById('cpfSimulationFeedback');
    const cpfSimulationGroup = document.getElementById('cpfSimulationGroup'); // Grupo do formulário do CPF

    const loadingIndicator = document.getElementById('loadingIndicator');
    const progressBar = document.querySelector('.progress');
    const loadingSteps = document.querySelector('.loading-steps');

    const simulationOutcomeMessage = document.getElementById('simulationOutcomeMessage');
    const outcomeTitle = document.getElementById('outcomeTitle');
    const outcomeText = document.getElementById('outcomeText');
    const actionButtonsContainer = simulationOutcomeMessage ? simulationOutcomeMessage.querySelector('.action-buttons-container') : null;
    const bottomButtonContainer = document.getElementById('bottomButtonContainer'); // Onde fica o botão "Simular com CPF"


    if (cpfSimulationInput) {
        applyCpfMask(cpfSimulationInput); // Aplica máscara ao CPF na tela de simulação
    }

    if (simulateCpfButton) {
        simulateCpfButton.addEventListener('click', () => {
            applyClickEffect(simulateCpfButton);

            const cpf = cpfSimulationInput ? cpfSimulationInput.value.replace(/\D/g, '') : '';

            // 1. Validação do CPF
            if (!isValidCPF(cpf)) {
                if (cpfSimulationFeedback) {
                    cpfSimulationFeedback.textContent = 'CPF inválido. Por favor, verifique o número.';
                    cpfSimulationFeedback.style.display = 'block';
                }
                cpfSimulationInput.focus(); // Foca no campo para correção
                return; // Impede a continuação da simulação
            } else {
                if (cpfSimulationFeedback) cpfSimulationFeedback.style.display = 'none';
            }

            // Esconde o campo de CPF e o botão "Simular com CPF"
            if (cpfSimulationGroup) cpfSimulationGroup.style.display = 'none';
            if (bottomButtonContainer) bottomButtonContainer.style.display = 'none';
            
            // Oculta mensagens anteriores e exibe o indicador de carregamento
            if (simulationOutcomeMessage) simulationOutcomeMessage.style.display = 'none';
            if (loadingIndicator) loadingIndicator.style.display = 'flex'; // Exibe o spinner
            
            // Reseta a barra de progresso
            if (progressBar) progressBar.style.width = '0%';
            if (loadingSteps) loadingSteps.textContent = 'Etapa 1 de 3: Validando CPF e elegibilidade...';

            let progress = 0;
            const interval = setInterval(() => {
                progress += 5;
                if (progressBar) progressBar.style.width = `${progress}%`;

                if (progress === 30) {
                    if (loadingSteps) loadingSteps.textContent = 'Etapa 2 de 3: Consultando bases de dados financeiras...';
                } else if (progress === 70) {
                    if (loadingSteps) loadingSteps.textContent = 'Etapa 3 de 3: Obtendo propostas personalizadas...';
                }

                if (progress >= 100) {
                    clearInterval(interval);
                    setTimeout(() => {
                        if (loadingIndicator) loadingIndicator.style.display = 'none'; // Esconde o spinner

                        // Simula se encontrou valor ou não (70% de chance de encontrar)
                        const hasValue = Math.random() > 0.3; // true para valor encontrado, false para não

                        if (actionButtonsContainer) actionButtonsContainer.innerHTML = ''; // Limpa botões anteriores

                        if (hasValue) {
                            if (outcomeTitle) outcomeTitle.textContent = '🎉 Valor Disponível!';
                            if (outcomeText) outcomeText.innerHTML = 'Parabéns! Identificamos um valor significativo para você no seu FGTS. Prossiga para os próximos passos e libere seu saque!';
                            if (simulationOutcomeMessage) simulationOutcomeMessage.style.display = 'block';

                            const continueButton = document.createElement('button');
                            continueButton.id = 'continueToWhatsappButton';
                            continueButton.className = 'main-button whatsapp interactive';
                            continueButton.innerHTML = '<i class="fab fa-whatsapp"></i> Liberar Meu FGTS Agora!';
                            continueButton.addEventListener('click', () => {
                                applyClickEffect(continueButton);
                                setTimeout(() => {
                                    // Navegação ajustada para GitHub Pages
                                    window.location.href = 'screen_final_data.html';
                                }, 300);
                            });
                            actionButtonsContainer.appendChild(continueButton);

                        } else {
                            if (outcomeTitle) outcomeTitle.textContent = '😔 Sem Saldo Disponível no Momento.';
                            if (outcomeText) outcomeText.innerHTML = 'Não identificamos valores disponíveis para saque-aniversário neste momento. Isso pode ocorrer por diversos motivos (saque-rescisão ativo, saldo baixo).';
                            if (simulationOutcomeMessage) simulationOutcomeMessage.style.display = 'block';

                            const whatsappSupportButton = document.createElement('button');
                            whatsappSupportButton.id = 'whatsappSupportButton';
                            whatsappSupportButton.className = 'main-button whatsapp interactive';
                            whatsappSupportButton.innerHTML = '<i class="fab fa-whatsapp"></i> Falar com Suporte';
                            whatsappSupportButton.onclick = () => {
                                applyClickEffect(whatsappSupportButton);
                                const phoneNumber = '5511978311920'; // Seu número de WhatsApp
                                const message = encodeURIComponent(`Olá, meu CPF é ${cpf}. Após a simulação no aplicativo, não foi encontrado valor para mim. Poderiam me ajudar a entender o motivo?`);
                                window.open(`https://wa.me/${phoneNumber}?text=${message}`, '_blank');
                            };
                            actionButtonsContainer.appendChild(whatsappSupportButton);

                            const tryAgainButton = document.createElement('button');
                            tryAgainButton.id = 'tryAgainButton';
                            tryAgainButton.className = 'main-button secondary-button interactive';
                            tryAgainButton.innerHTML = '<i class="fas fa-redo-alt"></i> Tentar Novamente';
                            tryAgainButton.onclick = () => {
                                applyClickEffect(tryAgainButton);
                                setTimeout(() => {
                                    // Reseta a tela para permitir nova simulação
                                    if (simulationOutcomeMessage) simulationOutcomeMessage.style.display = 'none';
                                    if (cpfSimulationGroup) cpfSimulationGroup.style.display = 'block'; // Exibe o campo de CPF
                                    if (bottomButtonContainer) bottomButtonContainer.style.display = 'flex'; // Exibe o botão "Simular com CPF"
                                    if (cpfSimulationInput) {
                                        cpfSimulationInput.value = ''; // Limpa o CPF
                                        cpfSimulationInput.focus();
                                    }
                                }, 300);
                            };
                            actionButtonsContainer.appendChild(tryAgainButton);
                        }
                    }, 800); // Atraso após o progresso para mostrar o resultado
                }
            }, 80); // A cada 80ms, o progresso aumenta 5%
        });
    }

    // --- Lógica da Final Data Screen ---
    const finalizeWhatsappButton = document.getElementById('finalizeWhatsappButton');
    const cpfInput = document.getElementById('cpf');
    const dobInput = document.getElementById('dob');
    const phoneInput = document.getElementById('phone');

    // Aplica as máscaras aos campos (fora da simulação)
    if (cpfInput) applyCpfMask(cpfInput);
    if (phoneInput) applyPhoneMask(phoneInput);

    if (finalizeWhatsappButton) {
        finalizeWhatsappButton.addEventListener('click', () => {
            applyClickEffect(finalizeWhatsappButton);

            const cpf = cpfInput ? cpfInput.value.replace(/\D/g, '') : '';
            const dob = dobInput ? dobInput.value : '';
            const phone = phoneInput ? phoneInput.value.replace(/\D/g, '') : '';

            let isValid = true;
            const cpfFeedback = document.getElementById('cpfFeedback');
            const dobFeedback = document.getElementById('dobFeedback');
            const phoneFeedback = document.getElementById('phoneFeedback');

            // Validação de CPF
            if (!isValidCPF(cpf)) {
                if (cpfFeedback) {
                    cpfFeedback.textContent = 'CPF inválido. Verifique o número.';
                    cpfFeedback.style.display = 'block';
                }
                isValid = false;
            } else {
                if (cpfFeedback) cpfFeedback.style.display = 'none';
            }

            // Validação de Data de Nascimento (verifica se está preenchida)
            // Uma validação mais robusta de data de nascimento (ex: idade mínima) pode ser adicionada aqui.
            if (dobInput && !dob) {
                if (dobFeedback) {
                    dobFeedback.textContent = 'Informe sua data de nascimento.';
                    dobFeedback.style.display = 'block';
                }
                isValid = false;
            } else {
                if (dobFeedback) dobFeedback.style.display = 'none';
            }

            // Validação de Telefone (DDD + 8 ou 9 dígitos)
            if (phoneInput && (phone.length < 10 || phone.length > 11)) {
                if (phoneFeedback) {
                    phoneFeedback.textContent = 'Telefone inválido. Formato: (XX) XXXX-XXXX ou (XX) 9XXXX-XXXX';
                } else if (phoneInput && phone.length === 0) { // Verifica se está vazio
                    if (phoneFeedback) {
                        phoneFeedback.textContent = 'Por favor, insira seu telefone.';
                    }
                }
                if (phoneFeedback) phoneFeedback.style.display = 'block';
                isValid = false;
            } else {
                if (phoneFeedback) phoneFeedback.style.display = 'none';
            }


            if (isValid) {
                const formattedCpf = cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
                const formattedDob = dob; // Data já está no formato YYYY-MM-DD
                const formattedPhone = phone.replace(/(\d{2})(\d{4,5})(\d{4})/, '($1) $2-$3');

                const messageContent = `Olá, gostaria de finalizar minha solicitação de Saque FGTS.
Meus dados:
CPF: ${formattedCpf}
Data de Nasc.: ${formattedDob}
Telefone: ${formattedPhone}`;

                const phoneNumber = '5511978311920'; // Seu número de WhatsApp aqui!
                const message = encodeURIComponent(messageContent);
                const whatsappUrl = `https://wa.me/${phoneNumber}?text=${message}`;

                window.open(whatsappUrl, '_blank'); // Abre o WhatsApp em uma nova aba
            }
        });
    }

    // --- Navegação do Botão Voltar ---
    document.querySelectorAll('.back-button').forEach(button => {
        button.addEventListener('click', (event) => {
            event.preventDefault(); // Evita o comportamento padrão do link
            applyClickEffect(button);
            setTimeout(() => {
                window.history.back(); // Volta para a página anterior
            }, 200);
        });
    });

    // --- Feedback Visual de Clique para Elementos Interativos ---
    function applyClickEffect(element) {
        element.classList.add('active');
        // Usar requestAnimationFrame para garantir que a classe seja aplicada antes de ser removida
        requestAnimationFrame(() => {
            setTimeout(() => {
                element.classList.remove('active');
            }, 300); // Remove a classe 'active' após 300ms
        });
    }

    // Adiciona o feedback visual a todos os elementos com a classe 'interactive'
    // Usa 'mousedown' para efeito instantâneo e não interferir com ':focus' em inputs
    document.querySelectorAll('.interactive').forEach(element => {
        element.addEventListener('mousedown', () => {
            applyClickEffect(element);
        });
    });

});
