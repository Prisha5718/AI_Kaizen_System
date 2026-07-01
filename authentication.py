from firebase_ops import authenticate_user


def login_user(company, user_id, password):
    return authenticate_user(company, user_id, password)
