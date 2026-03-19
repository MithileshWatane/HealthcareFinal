import tensorflow as tf
import numpy as np

def compute_saliency(model, X, class_index):
    """
    X: (epochs, mel, time, channels)
    Returns: normalized attention maps
    """
    X_tf = tf.convert_to_tensor(X, dtype=tf.float32)

    with tf.GradientTape() as tape:
        tape.watch(X_tf)
        preds = model(X_tf)
        score = preds[:, class_index]

    grads = tape.gradient(score, X_tf)
    saliency = tf.reduce_mean(tf.abs(grads), axis=-1)

    # Normalize
    saliency = saliency / (tf.reduce_max(saliency) + 1e-8)
    return saliency.numpy()
