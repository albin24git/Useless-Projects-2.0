
import os
import io
import random
import google.generativeai as genai
from PIL import Image

GOOGLE_API_KEY = "AIzaSyCuFvn3mq0MB5my4quqMHR0gmUBD-bG1sE"

genai.configure(api_key=GOOGLE_API_KEY)

model_name = 'gemini-1.5-flash-latest'
model = genai.GenerativeModel(model_name)
print(f" AI Model Initialized Successfully (using '{model_name}').")


def suggest_self_name(image_data: bytes, subject: str = "person") -> str:
   
    print(f" AI is analyzing photo '{subject}' ")   
    person_image = Image.open(io.BytesIO(image_data))
    
    if subject == 'father':
        context_phrase = "the father of the person in this photo"
    else:
        context_phrase = "the person in this photo"
 
    prompt = f"""
    Analyze the photo. Your task is to suggest a name 
    Imagine what they would be like based on the photo provided.

    INSTRUCTIONS:
    1.  Your choice must be a modern name from Kerala, India .
    the name cant be with the phrase 'Arjun' 
    the name should be rarely popular
    The name should be randomly created by AI. The names should be unique..
    3.  You must provide some funny short, witty, and "spicy" REASON whic needent be connected also.

    Your entire response MUST follow this exact, two-line format and nothing else:
    
    NAME: [The one suggested name]
    REASON: [The short, witty, and spicy one-sentence reason.]
    """
    
    generation_config = genai.types.GenerationConfig(temperature=1.0)
    
    response = model.generate_content(
        [prompt, person_image],
        generation_config=generation_config
    )
    return response.text

def suggest_partner_name(image_data: bytes) -> str:
    """
   
    """
    print(" AI is analyzing photo for 'Who For Me?'")
    
    person_image = Image.open(io.BytesIO(image_data))
    
    prompt = f"""
    Analyze the person in this photo. Imagine their ideal, complementary, opposite-gender partner from kerala India.

    INSTRUCTIONS:
    The name should be randomly created by AI. The names should be unique.
    NAME: [The one suggested name for the partner]
    REASON: [The short, witty, and spicy reason for the match.]
    Your entire response MUST follow this exact, two-line format and nothing else:
    
    NAME: [The one suggested name]
    REASON: [The short, witty, and spicy one-sentence reason.]
    
    """
    
    generation_config = genai.types.GenerationConfig(temperature=2.0)
    
    response = model.generate_content(
        [prompt, person_image],
        generation_config=generation_config
    )
    return response.text