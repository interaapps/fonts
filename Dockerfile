FROM golang:1.17.5-alpine
RUN apk add --no-cache git

WORKDIR /app
COPY . .

COPY go.mod .
COPY go.sum .

RUN go mod download

RUN go build -o main .

CMD ["./main"]