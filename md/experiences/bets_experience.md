### BETS Co-op

Python Scrapers:

What was the primary purpose or goal of scraping these 21+ dynamic websites? What kind of data were you collecting?

> My company is working on a video portal called GovSession, where it contains all the publicly available videos from all the state websites, like Ohio, Connecticut, Delaware, New York, etc. We previously did have scrapers which worked, which were written by the previous batch of BETS co-op students. These students marked 21 of these scrapers as not working, and so our boss asked us (Me, Hiroki Nariyoshi, Diya Nair, all BETS co-op students) to scrape these websites for videos essentially, to see if it's possible to get the 21 "unscrapable" ones to work.

Could you describe a specific instance where "reverse-engineering network traffic" was particularly challenging or interesting? What steps did you take?

> Yes that was interesting. So a lot of website just had either youtube links which we could download directly with yt-dlt or video links directly in the html, but some of these websites required more work. I inspected them and saw a blob: url which is not good since we can't download from them. After searching online I found resources on how to get the link, and they suggested to go to the network tab, look at activities and see if you can find a video link. I did the same and found .m3u8 links on those websites and after testing they can indeed download. Then I searched up how to implement, or rather check network logs using selenium, the proceeded to implement that.

What were some of the common "anti-scraping mechanisms" you encountered, and what specific Selenium or BeautifulSoup4 techniques did you find most effective in bypassing them?

> Above, if you consider .m3u8 links "anti-scraping". 

> There was some websites refusing, but I added some chrome options as well as user agent

```
def setup_driver():
    """
    Set up the Chrome WebDriver with options that help avoid detection by the website.
    
    Returns:
        WebDriver: The configured Chrome WebDriver instance.
    """
    # Define a user agent string to mimic a real browser
    user_agent = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36"
    
    # Set up Chrome options
    options = webdriver.ChromeOptions()
    options.add_argument(f"user-agent={user_agent}")
    options.add_argument("--disable-gpu")
    # Uncomment the following line to run in headless mode (no GUI)
    options.add_argument("--headless=new")
    options.add_argument("--mute-audio")
    options.add_argument("--disable-blink-features=AutomationControlled")
    options.add_argument("--ignore-certificate-errors")
    options.add_experimental_option("excludeSwitches", ["enable-automation"])
    options.add_experimental_option("useAutomationExtension", False)
    options.set_capability("goog:loggingPrefs", {"performance": "ALL"})

    # Create the WebDriver service and instance
    service = Service()
    driver = webdriver.Chrome(service=service, options=options)
    
    # Enable network logging and set the user agent override
    driver.execute_cdp_cmd("Network.enable", {})
    driver.execute_cdp_cmd("Network.setUserAgentOverride", {"userAgent": user_agent})
    # Hide the webdriver property to help avoid detection
    driver.execute_cdp_cmd("Page.addScriptToEvaluateOnNewDocument", {
        "source": "Object.defineProperty(navigator, 'webdriver', {get: () => undefined})"
    })
    return driver
```

Can you give an example of how the scalability of these scrapers was designed or achieved?

> Yes so the AI team wanted us to log them, include start and end dates in a separate config.json file that can control the python scraper, so essentially the scraper will, through whatever means, try to download videos only within this time range. It is easier on some websites than the rest, for example, ones with calendar would be much easier than the websites with just a video list. 

```
{
    "output_path": "/home/ubuntu/political_sessions_multi/downloading/archive_vids",
    "successful_download_json_path": "/home/ubuntu/political_sessions_multi/downloading/2025_winter_download_and_scrape_fix/archive_download/federal_reserve/successful_downloads.json",
    "failed_download_json_path": "/home/ubuntu/political_sessions_multi/downloading/2025_winter_download_and_scrape_fix/archive_download/federal_reserve/failed_downloads.json",
    "log_path": "/home/ubuntu/political_sessions_multi/downloading/2025_winter_download_and_scrape_fix/archive_download/federal_reserve/federal_reserve_video_scraper.log",
    "start_date": "2025-01-01",
    "end_date": "2025-02-15"
}
```

What was the impact or use of the data collected by these scrapers for EON Media?

> So they used it to download more videos that they might not have been able to previously.

> I have attached an example file below 

Postman-based Security Tests:

What was the scope of these security tests? Were you looking for specific types of vulnerabilities beyond the referrer header misconfiguration?

> Not really, my boss just asked us to try to scrape one of our own website.
>
> As I mentioned earlier, our company makes AI video analysis projects. One of them in WRAL Archives, which processes archival videos from WRAl for brands, people, transcripts, objects, etc. One day our boss (this is before the web scraping tasks above) just asked us to try scraping this website to see if we can get the videos. 

Could you walk me through the process of how you discovered the "referrer header misconfiguration"? What led you to investigate that particular aspect?

> So when trying to download the videos, I found it that even though the video link is not obvious, it can be pieced back together from clues in the html code. Then I proceeded tryingg to access that reconstructed website, but it turns out that it's blocked and I can't access it. From searching online it turns out that you can add a request header to the request called "referrer". So I loaded up Postman, added "referrer = wralarchives.com" or something and bam it worked. 

What were the potential consequences of this misconfiguration for EON Media?

> Since our company stores these archival videos for WRAL (for this website) and you have to purchase rights from the wral archives portal to download/use certain video clips,,, this can be easily bypassed with the method above and someone skilled can use it to scrape every video on the website without buying.

How did you report this finding, and were you involved in discussions about its remediation?

> Not really, that's just my speculation (consequences above). 
>
> I basically told my boss this is what happened and you can use this header to go around it, and he said "oh wow this is interesting I'll get [name] to look into this"

CNN/ResNet Architecture Research:

What was the specific objective of the logo detection project? What problem was it trying to solve for EON Media?

> So we have a new client which wants sports videos analyzed. It can be basketball, hockey, or something like american football. On the videos there are sometimes names of the team right beside the scores, which the clients want identified, which is easy and already handled. However what is not easy is if it only has a logo instead of the text, and that is what we wanted to solve. 

When you researched CNN/ResNet architectures, what were some of the key considerations or trade-offs you identified for this specific logo detection task?

> The logo detection is split into 2 different potential paths. Diya Nair (co-op partner, see above) was investigating into the SIFT algorithm, and I went ahead with CNN/ResNet.
> The person who gave us this task was Allyn Bao, an upper year co-op student which is in the AI team. He gave us some potential things to look into and CNN/REsNet was one of them. 
> I am researching it at the same time as Diya was researching her SIFT algorithm, but in the end we didn't finish implementing everything and only had time for a rough code.
>
> I had 2 codes, train.py and classify.py. I grabbed aropund 500 images from roboflow universe, and added 500 more images for a total  of 1000 image dataset, split into test/valid/train. The train.py code actually removes the classification layer and outputs the features directly into a npy file and also generate a t_sne visualization graph. 
> Train.py use knn to predict the output
> At the end of the co-op, the model is really good against the test pictures resulting 100% accuracy, but against actual pictures it worked not really well.

You mentioned identifying key CV papers (SIFT/MSER, Homography). How did these concepts specifically influence the team's strategy or the proposed approach to logo detection?

> So that was another thing ALlyn requested. He said if we have time we can look into tracking players across the field, and see what kind of things are available. 
> I found 2 papers on SIFT/MSER as well as Homography, and he said it's interesting, and (since he's leaving co-op at the same time as us) he briefed the new permanent ai software engineer on these papers. 

Were there any other machine learning or computer vision techniques you explored or considered for this task?

> Not really

What was your role in "influencing team strategy"? Did you present your findings or contribute to design discussions?

>By influencing team strategy I mean above, where Allyn briefed the new guy on these two papers so he might look into it in the future. Since I am not in the company anymore I can't say if it actually went through or not.

Here's the readme file of logo classifier:

# CNN Testings for Logo Classification

This repository contains scripts for training and using a Convolutional Neural Network (CNN), specifically ResNet50, for logo classification tasks.

The end goal of this project is to accurately deduce the logo of an NBA team from a given image. The dataset used for training and testing comprises logos for all 30 NBA teams.

## Table of Contents

- [CNN Testings for Logo Classification](#cnn-testings-for-logo-classification)
  - [Table of Contents](#table-of-contents)
  - [Prerequisites](#prerequisites)
  - [Workflow Overview](#workflow-overview)
  - [Codes](#codes)
  - [Folders and Files](#folders-and-files)
  - [Experiments and Results](#experiments-and-results)


## Prerequisites

It is highly recommended to use a Conda environment to manage dependencies. Before running the scripts, set up the environment and install the necessary libraries:

```bash
# Create a new conda environment (e.g., named 'cnn') with Python 3.12
conda create -n cnn python=3.12

# Activate the environment
conda activate cnn

# Install the required packages using conda
conda install tensorflow numpy matplotlib scikit-learn opencv
```
*Note: Depending on your system and CUDA setup, you might need specific versions or channels (like conda-forge) for TensorFlow GPU support. The command above typically installs a version compatible with your setup.*

## Workflow Overview

A typical workflow using these scripts involves setting up the data, training the model under specific conditions, extracting features, and then using those features for classification or analysis. You can repeat steps 3-5 for different experimental setups.

1.  **Prepare Data:** Place your initial image data into the `full_dataset` folder, organized by class subdirectories (one for each NBA team).
2.  **Preprocess (Optional):** Run `process.py` to convert any PNG images in `full_dataset` to JPG format.
3.  **Split Data:** Run `split_dataset.py` to divide the images currently in `full_dataset` into training, validation, and testing sets within the `classification_dataset` folder. *Note: You might modify `full_dataset` or change split ratios/seed between experiments.*
4.  **Train & Extract Features:** Run `train.py` using the current `classification_dataset`. Save the extracted features and labels into a *uniquely named* output folder within `all_features` (e.g., `all_features/tf_features.1`, `all_features/tf_features.dataset_v2_split_80_10_10`, etc.) to represent a specific experiment (e.g., a run with a particular dataset version, train/valid/test split, or other parameter changes).
5.  **Repeat Experiments (Optional):** Modify the source data (`full_dataset`), rerun `split_dataset.py` (potentially with different parameters), and rerun `train.py` saving to a *new* subfolder in `all_features` (e.g., `all_features/tf_features.2`).
6.  **Visualize Features (Multiple Experiments):** Run `generate_all_tsne.py` pointing to the `all_features` directory. This will generate and save a t-SNE plot (`tsne_visualization.png`) inside *each* experimental feature subfolder found (e.g., `tf_features.1`, `tf_features.2`, etc.), allowing comparison of the feature space across different experimental conditions.
7.  **Classify New Image:** Run `classify.py`. You *must* specify which experimental feature set to use via the `--feature_dir` argument (e.g., `--feature_dir all_features/tf_features.1`). The script will load the features and labels from *that specific experiment* to train the KNN classifier and predict the class of a new image (e.g., an image from the `screenshots` folder). Consult `test_results.xlsx` for classification results from various experiments.

## Codes

This repository includes the following Python scripts:

*   **`process.py`**:
    *   **Purpose:** Scans a specified folder (`full_dataset` by default) for PNG images. Converts them to JPG format, handling transparency by blending with a white background, and replaces the original PNG file. Useful for standardizing image formats.
    *   **Usage:**
        ```bash
        python process.py
        ```
        *(Note: Ensure the `root_folder` variable within the script points to your raw dataset)*

*   **`split_dataset.py`**:
    *   **Purpose:** Splits a directory of class-folders (like `full_dataset`) into `train`, `valid`, and `test` subsets based on specified ratios and a random seed. Creates a new directory structure (`classification_dataset` by default) suitable for training. Run this before each `train.py` experiment if the source data or desired split changes.
    *   **Inputs:** Source directory (`--source_dir`), output directory name (`--output_dir`), split ratios (`--train_ratio`, `--val_ratio`, `--test_ratio`), random seed (`--seed`).
    *   **Outputs:** Creates the specified output directory containing `train/`, `valid/`, `test/` subfolders, each populated with class subfolders and the split image files.
    *   **Example Usage:**
        ```bash
        python split_dataset.py -s full_dataset -o classification_dataset --train_ratio 0.7 --val_ratio 0.15 --test_ratio 0.15 --seed 42
        ```

*   **`train.py`**:
    *   **Purpose:** Trains a ResNet50 model on a split dataset (e.g., `classification_dataset`). Extracts features from the trained model's backbone (average pooling layer). Saves these features and corresponding labels as `.npy` files into a *specific output directory representing one experiment* (e.g., `all_features/tf_features.1`). Optionally visualizes the features *for that specific run* using t-SNE.
    *   **Inputs:** Data directory (`--data_dir`), **output directory for this experiment's features** (`--output_dir`), training parameters (batch size, epochs).
    *   **Outputs:** Saves `train_features.npy`, `train_labels.npy`, `valid_features.npy`, `valid_labels.npy`, `test_features.npy`, `test_labels.npy` to the specified `--output_dir`. If `--visualize` is used, it also saves `tsne_visualization.png` in that same directory. Prints training progress and feature dimensions.
    *   **Example Usage (saving experiment 1 results):**
        ```bash
        # Ensure classification_dataset reflects the desired state for experiment 1
        python train.py --data_dir classification_dataset --output_dir all_features/tf_features.1 --epochs 15 --batch_size 32 --visualize
        ```

*   **`generate_all_tsne.py`**:
    *   **Purpose:** Automates the generation of t-SNE visualizations for multiple experimental results. It scans a root directory (`all_features` by default) for subfolders containing feature sets. For each subfolder found (representing one experiment like `tf_features.1`, `tf_features.2`, etc.), it loads the `train` and `valid` features/labels, generates a t-SNE plot visualizing the feature space for *that specific experiment*, and saves it as `tsne_visualization.png` *inside that experiment's subfolder*. This allows for easy visual comparison across different runs.
    *   **Inputs:** Root directory containing the experimental feature folders (`--features_root`), path to the split dataset directory (`--data_dir`, needed for class names consistent across plots), optional folder name pattern (`--pattern`).
    *   **Outputs:** Saves `tsne_visualization.png` in each processed feature subfolder (e.g., `all_features/tf_features.1/tsne_visualization.png`, `all_features/tf_features.2/tsne_visualization.png`, etc.). Prints progress for each folder.
    *   **Example Usage:**
        ```bash
        python generate_all_tsne.py --features_root all_features --data_dir classification_dataset
        # Use --pattern if folder names differ, e.g.: --pattern "experiment_*"
        ```

*   **`classify.py`**:
    *   **Purpose:** Classifies a single input image using a K-Nearest Neighbors (KNN) classifier trained on features from *one specific, pre-computed experiment*. It loads the training features/labels from the specified experimental results folder (e.g., `all_features/tf_features.1`), extracts features from the input image using a ResNet50 backbone, trains the KNN on the loaded data, and predicts the class.
    *   **Inputs:** Path to the image to classify (`--image`), data directory (`--data_dir`, to infer class names), **the specific feature directory for the desired experiment** (`--feature_dir`), number of neighbors for KNN (`--neighbors`).
    *   **Outputs:** Prints the validation accuracy of the KNN model (trained and evaluated using the specified experiment's features/labels) and the top predicted classes (with probabilities) for the input image.
    *   **Example Usage (using features from experiment 1 to classify a screenshot):**
        ```bash
        python classify.py --image screenshots/lakers.png --data_dir classification_dataset --feature_dir all_features/tf_features.1 --neighbors 5
        ```
    *   **Example Usage (using features from experiment 2 to classify an official logo):**
        ```bash
        python classify.py --image screenshots/cavaliers_actual.png --data_dir classification_dataset --feature_dir all_features/tf_features.2 --neighbors 5
        ```

## Folders and Files

The scripts interact with the following folders and key files:

*   **`full_dataset/`**:
    *   **Purpose:** Contains the source dataset images used for training, validation, and testing splits. This may be modified between experiments (adding/removing images).
    *   **Structure:** Contains subdirectories for each of the 30 NBA teams (e.g., `76ers/`, `Blazers/`, `Lakers/`, `Warriors/`), each holding the corresponding logo image files for that team.
    *   **Used by:** `process.py` (input/output), `split_dataset.py` (input).

*   **`classification_dataset/`** (or name specified by `-o` in `split_dataset.py`):
    *   **Purpose:** Holds the dataset split into training, validation, and test sets *for a particular experiment run*. This folder is typically regenerated by `split_dataset.py` before running `train.py` if the source data or split parameters change.
    *   **Structure:** Contains `train/`, `valid/`, and `test/` subdirectories. Each contains class subdirectories (e.g., `train/Lakers/`, `valid/Lakers/`) holding the image files for that specific split.
    *   **Used by:** `split_dataset.py` (output), `train.py` (input), `generate_all_tsne.py` (input - for class names), `classify.py` (input - for class names).

*   **`all_features/`**:
    *   **Purpose:** Acts as a central repository to organize and store the results (extracted features and labels) from multiple, distinct experimental runs.
    *   **Structure:** Contains uniquely named subdirectories, each representing a single experiment (e.g., `tf_features.1/`, `tf_features.2/`, `dataset_v2_split_80_10_10/`...). The naming convention should ideally help identify the experiment.
    *   **Used by:** `generate_all_tsne.py` (input via `--features_root`). Parent directory where experimental results from `train.py` are saved.

*   **`all_features/<experiment_name>/`** (Example: `all_features/tf_features.1/`):
    *   **Purpose:** Stores the extracted features (`.npy`) and labels (`.npy`) resulting from *one specific training experiment run* (defined by the dataset state, split parameters, etc., used when `train.py` was executed to create this folder).
    *   **Structure:** Contains `train_features.npy`, `train_labels.npy`, `valid_features.npy`, `valid_labels.npy`, `test_features.npy`, `test_labels.npy`. After running `generate_all_tsne.py`, it will also contain `tsne_visualization.png` specific to this experiment's features.
    *   **Used by:** `train.py` (output target for a specific run), `classify.py` (input via `--feature_dir`, requires the path to *this specific folder*), `generate_all_tsne.py` (input - processes this folder).

*   **`screenshots/`**:
    *   **Purpose:** Used to store individual images for testing the classifier (`classify.py`), separate from the main dataset splits. This allows testing on specific examples, including both 'clean' official logos (like those from Wikipedia) and logos captured 'in the wild' from sources like video highlights.
    *   **Structure:** Contains individual image files. Examples include: `cavaliers_actual.png` (official logo from Wikipedia), `cavaliers.png` (screenshot from video), `hawks.jpg` (official logo), `hornets.png` (screenshot), `lakers.png` (screenshot), `pistons.png` (screenshot).
    *   **Used by:** Individual images from here are provided to `classify.py` via the `--image` argument for prediction.

*   **`test_results.xlsx`**:
    *   **Purpose:** Contains a detailed summary of classification results. For each experimental iteration (corresponding to folders in `all_features/`), it shows the top predictions made by `classify.py` for the test images stored in the `screenshots/` folder.
    *   **Structure:** Spreadsheet format, likely with columns for Iteration, Tested Image, Prediction 1, Probability 1, Prediction 2, Probability 2, etc.
    *   **Used by:** Reference for comparing the performance impact of different experimental changes.

## Experiments and Results

Multiple experimental runs have been conducted, varying the dataset content (`full_dataset`) and potentially the train/valid/test splits (`split_dataset.py`). The features extracted from each run are stored in correspondingly named subfolders within `all_features/` (e.g., `tf_features.1`, `tf_features.2`, etc.).

The `classify.py` script was used to test the performance of the KNN classifier trained on each experimental feature set, using a fixed set of test images from the `screenshots/` folder.

**Detailed classification results (top predictions and probabilities) for each iteration against the test images can be found in the `test_results.xlsx` file located in the main project directory.**

The `generate_all_tsne.py` script can be used to create t-SNE plots within each experimental folder in `all_features/`, allowing for visual inspection and comparison of how different experimental conditions affected the learned feature space.


Done ~~Today!~~ Yesterday and early today
- Finished gathering image for dataset for a total of 1,000 images exactly across 30 classes (+~400 new images obtained)
  - Updated Allyn on this during lunchtime
  - Used New Code: process.py
    - Goes through the folder, turning each .png into .jpg and delete their transparency and give them white background
- Split the dataset to 80 training, 10 valid, 10 testing
  - Used New Code: split_dataset.py
    - Takes all the images under full_dataset , randomizes them, and split them according to what the user want (using args. All my new code use args)
- Successfully trained with 20 epochs in 2h20m (I'm not sure why it's so slow)
  - Had a very nice looking t-SNE graph, with excellent grouping.
  - Loss of around 0.006, all around nice looking training
- Unfortunately, upon testing, it could not classify a lot of logos from screenshots like lakers, cavaliers, etc
- Performed more detailed testings
  - Grabbed previous tf_feature (generated by previous runs) from recycle bin, for a total of 11 tf_feature runs and put them inside the all_features folder
  - Performed testing on 6 images for each of the tf_feature iterations, for a total of 66 tests
  - Recorded in details in test_results.xlsx
    - Include color code regarding whether different results match or not for nice visualizations
  - Use New Code: generate_t_sne.py
    - Takes in all the iterations under all_features, and for each generate a t_sne graph for nice visualizations
- Github
  - Cleaned up my codes, added detailed comments and docstrings
  - Wrote readme.md for detailed descriptions
    - Contains Workflow Overview, Codes , Folders and Files, Experiments and Results
    - Each contains detailed descriptions of each files, folders or codes.
  - Renamed folder name to logo_classifier_resnet
  - Committed and pushed into Winter 2024 Branch
- Started on Confluence page
  - Included:
  - Description of the project
  - Simple description of train.py and classify.py
  - Tests
    - Detailed walkthrough of iteration 11
  - Conclusion and recommendation on next actions?
- Finished Confluence page...
For Later today:
- Hop on a call with Allyn to meet Krys so we can say hi and tell him what we're working on
- wrapping up on logo classifier. If there's time, perform one last round of testing.











For the Connecticut scraper (or another one you're particularly proud of), can you describe one particularly tricky anti-scraping mechanism you overcame beyond the .m3u8 discovery?

> Not really to be honest

How did your team (you, Hiroki, Diya) typically divide the work for tackling the 21 scrapers? Did you specialize in certain types of sites, or collaborate on each one?

> Yes so basically we call every day during work. We work remote so we can call. During the calls we assign work to everyone. 
>
> For the websites, there are some that are harder than others. For example there are a group of sites based on https://sg001-harmony.sliq.net/ and those can use the same scraper, so Hiroki did the harmony sliq websites. For me I chose the hardest ones to scrape (marked by previous students), so I only did 4 websites. 
>
> There are other instances of us collaborating between us
>
> For example for some of the QA tickets, we can distribute them. For example we also had some audio annotation tasks where we have to determine who is speaking, or another time where we had to annotate pictures, or annotate sports videos (get goal timestamp, foul, rebound, brand appearance, etc.) or resolve tickets
>
> Also, every day I open up obsidian and take notes in it. Basically I just write down what I am doing at that moment, so I have a record of everything I did.

Did this experience with the referrer header make you more interested in web application security or penetration testing? (This could be a nice personal touch).

> nah

If you had more time on the logo detection project, what would have been your next 2-3 steps to try and improve its performance on "actual pictures"?

> changing the image dataset. It's currently very diverse and. for example, for the team "spurs" or "brooklyn nets" it might have different primary logo, secondary logo, and more historical logos.
> I'm not sure, because I trained for 20 epochs and had a 0% error during training. I think data augmentation on some logos might help

Do you have an image of one of the "very nice looking t-SNE graphs" you could include on the website?

> yes