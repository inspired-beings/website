FROM hugomods/hugo:dart-sass-node

WORKDIR /src

COPY . .

RUN yarn
RUN yarn build

ENTRYPOINT [ "yarn", "start" ]
