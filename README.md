# Email Form API

A Cloudflare worker designed to allow contact-us forms to function. Built upon Cloudflare workers.

## Why use it?
I created this worker for my personal [portfolio](https://raprograms.co.uk) website to send me an email with any form submissions. 

My original solution provided me 100 free emails, with additional ones costing money. This is not ideal for portfolio site where I want anyone to be able to contact me.

This worker was created due to both Cloudflare and Resend offering free monthly usages of their respective products. Allowing anyone to send me inquiries from my contact form without needing me to constantly monitor the solution.

## Tech stack
| Tech                                                                              | Details                                                                         |
|-----------------------------------------------------------------------------------|---------------------------------------------------------------------------------|
| [Cloudflare workers](https://developers.cloudflare.com/workers/platform/pricing/) | Free 100,000 requests per day (10 milliseconds of CPU time maximum per request) |
| [Resend](https://resend.com/pricing)                                              | 3,000 emails per month (100 emails a day)                                       |

*Details accessed on 16th May 2026*


## Get started

### Prerequisites
1) A Cloudflare account is created ([Signup here](https://dash.cloudflare.com/sign-up))
2) A Resend account is created ([Signup here](https://resend.com/signup))
3) Bun is installed ([Instructions here](https://bun.com/docs/installation))

## Installations

1) Clone this repo

```bash
git clone https://github.com/RAPrograms/Email-Form-API.git

or

git clone git@github.com:RAPrograms/Email-Form-API.git
```

2) Change directory

```bash
cd ./Email-Form-API
```

3) Install node packages

```bash
bun install
```

4) Set form schema

Change the schema to your use case (refer to the [schema format](#Schema-Format))

```bash
vim ./schema.toml
```

5) Deploy

You may need to do `wrangler login` before you can do this step

```bash
wrangler deploy
```

## Setup Resend

1) Create API key

Create and copy API key

```http
Goto https://resend.com/api-keys?new=true
```

2) Setup domain

```http
Goto https://resend.com/domains
```

## Setup enviroment
1) Go to Cloudflare dashboard

```http
Goto https://dash.cloudflare.com/
```

2) View all workers

```
Open Build: Compute > Workers & Pages
```

3) Create variables

Open `email-form-api`, then go to `Settings`. Under `Variables and Secrets`, click add

Create the following **secret** values
- RESENT_API_SECRET: The Resend API key
- RECEIVING_EMAIL: The email address you want all form submissions to be sent to
- SERVICE_EMAIL: The email Resend uses. Example is inquiries@emails.&lt;domain&gt;

# Schema Format
This system uses the `/schema.toml` file to define what form values are captured and how they are validated.

```
[email] # States the feild name
pattern="email"
```

Validation options

| Name      | Description                                                                    | Options                             |  Default |
|-----------|--------------------------------------------------------------------------------|-------------------------------------|----------|
| type      | Rejects any value which is not a valid instance of this type                   | "string", "number", "bool"          | "string" |
| required  | States wether the API should allow this value to be empty or null              | true, false                         | true     |
| pattern   | Checks if the value is valid against this regex. There are also premade regexs | Any regex or premade ones ("email") | a|
| maxlength | Rejects any **string type** which length exceeds this value                    | Any integer                         | a|
| minlength | Rejects any **string type** which length fulls under this value                | Any integer                         | aa|
| maxvalue  | Rejects any **number type** which length exceeds this value                    | Any integer                         | a|
| minvalue  | Rejects any **number type** which length fulls under this value                | Any integer                         | a|