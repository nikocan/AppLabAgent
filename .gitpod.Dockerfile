FROM gitpod/workspace-full

# Install Node.js
RUN bash -c ". .nvm/nvm.sh && \
    nvm install 20.11.1 && \
    nvm use 20.11.1 && \
    nvm alias default 20.11.1"

# Install global packages
RUN npm install -g npm@latest yarn pnpm typescript

# Install system dependencies
RUN sudo apt-get update && sudo apt-get install -y \
    build-essential \
    python3 \
    python3-pip \
    && sudo rm -rf /var/lib/apt/lists/*

# Install Docker
RUN sudo apt-get update && \
    sudo apt-get install -y apt-transport-https ca-certificates curl software-properties-common && \
    curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo apt-key add - && \
    sudo add-apt-repository "deb [arch=amd64] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable" && \
    sudo apt-get update && \
    sudo apt-get install -y docker-ce docker-ce-cli containerd.io

# Install Docker Compose
RUN sudo curl -L "https://github.com/docker/compose/releases/download/v2.24.6/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose && \
    sudo chmod +x /usr/local/bin/docker-compose

# Clean up
RUN sudo apt-get clean && sudo rm -rf /var/lib/apt/lists/* /tmp/* /var/tmp/*

# Add user to docker group
RUN sudo usermod -aG docker gitpod