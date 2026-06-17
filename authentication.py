from firebase_ops import authenticate_user


def login_user(user_id, password):
    return authenticate_user(user_id, password)
