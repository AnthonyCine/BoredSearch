from django.core.mail import send_mail

BOREDEMAIL = 'noreply@ADD_DOMAIN.com'
VERIFICATIONURL = 'https://DOMAIN/verification'

class EmailVerify:

    def send_email_new_verification(self, email, code):
        p = '{text-align: center; font-size: 30px;}'
        div = '{text-align: center;}'
        b = '{font-size: 30px;}'
        head = '{background-color: #3264a8; min-height: 10vh; text-align: center; }'
        divide = '{border-top: 3px solid #bbb;}'
        main = '{min - height: 200vh; max-width: 500px; background-color: white; margin: 0 auto;}'
        inner = '{border-style: solid; border-color: #696969; border-width: 4px; border-radius: 25px; background-color: #f8f8f8;}'
        title = '{height: 100px; line-height: 100px; text-align: center;}'
        policy = '{font-size: 18px;}'

        c = str(code)
        code_split = []
        for x in c:
            code_split.append(x)
        email_verification_message = 'Welcome to BoredSearch, enter the code below to verify account: ' \
                                     f'{code}'
        html_verification_message = f"""
            <!DOCTYPE html>
            <html lang="en">
                <style>
                    p {p}
                    div {div}
                    b {b}
                    .head {head}
                    .divide {divide}
                    .main {main}
                    .inner {inner}
                    .title {title}
                    .policy {policy}
                </style>
                <head>
                    <meta charset="UTF-8">
                    <title>Board Search</title>
                </head>
                <body class="main">
                    <div class="inner">
                        <div class="title">
                            <p class="head">Welcome to Bored Search!</p>
                        </div>
                        <p>Enter verification code below into the app to verify your account!</p>
                        <div class="code">
                            <p>Verification code</p>
                            <b>{code_split[0]}</b> <b>{code_split[1]}</b> <b>{code_split[2]}</b> <b>{code_split[3]}</b>
                        </div>
                    </div>
                    <hr class="divide">
                    <div class="info">
                        <p class="policy">
                            If you have any questions, or concerns, please do not hesitate to contact website.
                            Bored Search will never email you and ask you to disclose or verify your password or banking information.
                            If you receive a suspicious email with a link requesting such request, do not click on the link.
                            Instead, report the e-mail to Bored Search.
                        </p>
                    </div>
                </body>
            </html>
        """
        send_mail(
            'BoredSearch Verification',
            email_verification_message,
            # html_verification_message,
            BOREDEMAIL,
            [email],
            fail_silently=False,
            html_message=html_verification_message,
        )


class PasswordResetEmail:

    def send_email(self, temp_password, email):
        send_mail(
            'BoredSearch Password Reset',
            f'Login with temporary password: {temp_password}.\n Please update password after logging in.',
            BOREDEMAIL,
            [email],
            fail_silently=False
        )
