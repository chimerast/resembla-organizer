FROM chimerast/resembla:latest

RUN yum install -y perl which \
  && rm -rf /var/cache/yum/* \
  && yum clean all

RUN curl -L git.io/nodebrew | perl - setup
ENV PATH /root/.nodebrew/current/bin:$PATH

RUN nodebrew install-binary stable
RUN nodebrew use stable

RUN npm install -g nodemon

WORKDIR /app/organizer

COPY package.json .

RUN npm install

COPY index.js config.json ./

EXPOSE 3000 50051
