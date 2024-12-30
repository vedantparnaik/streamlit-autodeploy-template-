import streamlit as st
import subprocess
import os

# Title and description
st.title("Recommendation System Template")
st.write("""
This is a ready-to-deploy recommendation system template.
You can create a virtual environment, install dependencies, and integrate your ML model.
""")

# User input for environment name
env_name = st.text_input("Enter the name for your virtual environment", "myenv")

# Button to trigger environment setup
if st.button("Create Environment and Install Dependencies"):
    st.write("Creating virtual environment and installing dependencies...")
    
    try:
        # Run the create_env.py script
        result = subprocess.run(
            ['python', 'create_env.py', env_name],
            capture_output=True, text=True
        )
        
        if result.returncode == 0:
            st.success("Virtual environment created and packages installed successfully!")
        else:
            st.error(f"Error: {result.stderr}")
    except Exception as e:
        st.error(f"An unexpected error occurred: {e}")

st.write("---")

# Placeholder for uploading data
st.subheader("Upload Your Dataset")
uploaded_file = st.file_uploader("Upload a CSV file", type=["csv"])
if uploaded_file:
    st.write("File uploaded successfully!")

# Placeholder for selecting a model
st.subheader("Select or Upload a Model")
model_file = st.file_uploader("Upload your trained ML model (.pkl)", type=["pkl"])
if model_file:
    st.write("Model uploaded successfully!")

# Button to run the recommendation system
if st.button("Run Recommendation System"):
    if uploaded_file and model_file:
        st.success("Recommendation system is running!")
        # Add your recommendation logic here
    else:
        st.warning("Please upload both dataset and model to proceed.")
