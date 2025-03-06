import { useMemo, useState,useEffect,useCallback } from "react";
import { Stack, IconButton, Modal, TextField, PrimaryButton, DefaultButton } from "@fluentui/react";
import DOMPurify from "dompurify";
import styles from "./Answer.module.css";
import { ChatAppResponse, getCitationFilePath } from "../../api";
import { parseAnswerToHtml } from "./AnswerParser";
import { AnswerIcon } from "./AnswerIcon";
import { SpeechOutputBrowser } from "./SpeechOutputBrowser";
import { SpeechOutputAzure } from "./SpeechOutputAzure";
//import { username } from "../LoginButton/LoginButton";
import { useMsal } from "@azure/msal-react";
import { getUsername } from "../../authConfig";
import { name } from "@azure/msal-browser/dist/packageMetadata";

 
interface Props {
    answer: ChatAppResponse;
    isSelected?: boolean;
    isStreaming: boolean;
    onCitationClicked: (filePath: string) => void;
    onThoughtProcessClicked: () => void;
    onSupportingContentClicked: () => void;
    onFollowupQuestionClicked?: (question: string) => void;
    showFollowupQuestions?: boolean;
    showSpeechOutputBrowser?: boolean;
    showSpeechOutputAzure?: boolean;
    speechUrl: string | null;
}
 
const FeedbackModal = ({ isOpen, onClose, onSubmit }: { isOpen: boolean; onClose: () => void; onSubmit: (name: string, comment: string) => void; }) => {
    const [name, setName] = useState("");
    const [comment, setComment] = useState("");
 
    const handleNameChange = (event: React.FormEvent<HTMLInputElement | HTMLTextAreaElement>, newValue?: string) => {
        setName(newValue || "");
    };
 
    const handleCommentChange = (event: React.FormEvent<HTMLInputElement | HTMLTextAreaElement>, newValue?: string) => {
        setComment(newValue || "");
    };
 
    const handleSubmit = () => {
        onSubmit(name, comment);
        onClose();
    };
 
    return (
        <Modal isOpen={isOpen} onDismiss={onClose} className={styles.feedbackModal}>
            <div className={styles.modalContent}>
                <h2 className={styles.modalTitle}>We Value Your Feedback</h2>
                {/* <TextField
                    label="Your Name"
                    value={name}
                    onChange={handleNameChange}
                    required
                    className={styles.textField}
                /> */}
                <TextField
                    label="Comment"
                    value={comment}
                    onChange={handleCommentChange}
                    multiline
                    rows={4}
                    required
                    className={styles.textField}
                />
                <div className={styles.buttonGroup}>
                    <PrimaryButton text="Submit" onClick={handleSubmit} className={styles.submitButton} />
                    <DefaultButton text="Cancel" onClick={onClose} className={styles.cancelButton} />
                </div>
            </div>
        </Modal>
    );
};
 
 
export const Answer = ({
    answer,
    isSelected,
    isStreaming,
    onCitationClicked,
    onThoughtProcessClicked,
    onSupportingContentClicked,
    onFollowupQuestionClicked,
    showFollowupQuestions,
    showSpeechOutputAzure,
    showSpeechOutputBrowser,
    speechUrl,

}: Props) => {
    const followupQuestions = answer.context?.followup_questions;
    const messageContent = answer.message.content;
    const parsedAnswer = useMemo(() => parseAnswerToHtml(messageContent, isStreaming, onCitationClicked), [answer]);
 
    const sanitizedAnswerHtml = DOMPurify.sanitize(parsedAnswer.answerHtml);
 
    const [isModalOpen, setModalOpen] = useState(false);
    const [feedback, setFeedback] = useState<{ up: boolean; down: boolean }>({ up: false, down: false });

    const [username, setUsername] = useState("");
    const { instance } = useMsal();

    useEffect(() => {
        const fetchUsername = async () => {
            setUsername((await getUsername(instance)) ?? "");
        };

        fetchUsername();
    }, []);
 
    const handleThumbsUp =  (name: string, comment: string)  => {
        handleFeedbackSubmit1(name,comment);
    };
 
    const handleThumbsDown = () => {
        setModalOpen(true);
    };


   const handleFeedbackSubmit1 = async (name: string, comment: string) => {
    setFeedback({ up: true, down: false });
 
    const postData = {
        mail: username, 
        // mail: "amit.pradeepnathmishra@yokogawa.com",
        remark: comment,
        question: (answer.message as { question?: string }).question || "No question provided",
        response: messageContent || "No response provided",
        name
    };
 
    try {
        const response = await fetch('https://prod-13.japaneast.logic.azure.com:443/workflows/7959a06cd7624befa57cfd66ea58f22b/triggers/manual/paths/invoke?api-version=2016-06-01&sp=%2Ftriggers%2Fmanual%2Frun&sv=1.0&sig=WsL6GEZ08HoqCfdMhLMpyBszIL4Div50usy811rS91s', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(postData),
        });
 
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
 
        const data = await response.json();
        console.log('Feedback submitted successfully:', data);
    } catch (error) {
        console.error('Error submitting feedback:', error);
    }
};
 

 
   const handleFeedbackSubmit = async (name: string, comment: string) => {
    setFeedback({ up: false, down: true });
 
    const postData = {
        mail: username, 
        // mail: "amit.pradeepnathmishra@yokogawa.com",
        remark: comment,
        question: (answer.message as { question?: string }).question || "No question provided",
        response: messageContent || "No response provided",
        name
    };
 
    try {
        const response = await fetch('https://prod-13.japaneast.logic.azure.com:443/workflows/7959a06cd7624befa57cfd66ea58f22b/triggers/manual/paths/invoke?api-version=2016-06-01&sp=%2Ftriggers%2Fmanual%2Frun&sv=1.0&sig=WsL6GEZ08HoqCfdMhLMpyBszIL4Div50usy811rS91s', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(postData),
        });
 
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
 
        const data = await response.json();
        console.log('Feedback submitted successfully:', data);
    } catch (error) {
        console.error('Error submitting feedback:', error);
    }
};
 
 
    return (
        <Stack className={`${styles.answerContainer} ${isSelected && styles.selected}`} verticalAlign="space-between">
            <Stack.Item>
                <Stack horizontal horizontalAlign="space-between">
                    {/* <AnswerIcon /> */}
                    <div>
                        <IconButton
                            style={{ color: "black" }}
                            iconProps={{ iconName: "Lightbulb" }}
                            title="Show thought process"
                            ariaLabel="Show thought process"
                            onClick={() => onThoughtProcessClicked()}
                            disabled={!answer.context.thoughts?.length}
                        />
                        <IconButton
                            style={{ color: "black" }}
                            iconProps={{ iconName: "ClipboardList" }}
                            title="Show supporting content"
                            ariaLabel="Show supporting content"
                            onClick={() => onSupportingContentClicked()}
                            disabled={!answer.context.data_points}
                        />
                        {showSpeechOutputAzure && <SpeechOutputAzure url={speechUrl} />}
                        {showSpeechOutputBrowser && <SpeechOutputBrowser answer={sanitizedAnswerHtml} />}
                    </div>
                </Stack>
            </Stack.Item>
 
            <Stack.Item grow>
                <div className={styles.answerText} dangerouslySetInnerHTML={{ __html: sanitizedAnswerHtml }}></div>
            </Stack.Item>
 
            {!!parsedAnswer.citations.length && (
                <Stack.Item>
                    <Stack horizontal wrap tokens={{ childrenGap: 5 }}>
                        <span className={styles.citationLearnMore}>Citations:</span>
                        {parsedAnswer.citations.map((x, i) => {
                            const path = getCitationFilePath(x);
                            return (
                                <a key={i} className={styles.citation} title={x} onClick={() => onCitationClicked(path)}>
                                    {`${++i}. ${x}`}
                                </a>
                            );
                        })}
                    </Stack>
                </Stack.Item>
            )}
 
            <Stack.Item>
                <Stack horizontal tokens={{ childrenGap: 10 }} verticalAlign="center">
                    <span>Was this answer helpful?</span>
                    {/* <IconButton
                        iconProps={{ iconName: "Like" }}
                        title="Thumbs up"
                        ariaLabel="Thumbs up"
                        onClick={() =>handleThumbsUp}
                        style={{ color: feedback.up ? "green" : "black" }}
                    /> */}
                    <IconButton
                            iconProps={{ iconName: "Like" }}
                            title="Thumbs up"
                            ariaLabel="Thumbs up"
                            onClick={() => handleThumbsUp(username, "Positive")} 
                            style={{ color: feedback.up ? "green" : "black" }}
                    />
                    <IconButton
                        iconProps={{ iconName: "Dislike" }}
                        title="Thumbs down"
                        ariaLabel="Thumbs down"
                        onClick={handleThumbsDown}
                        style={{ color: feedback.down ? "red" : "black" }}
                    />
                </Stack>
            </Stack.Item>
 
            {!!followupQuestions?.length && showFollowupQuestions && onFollowupQuestionClicked && (
                <Stack.Item>
                    <Stack horizontal wrap className={`${!!parsedAnswer.citations.length ? styles.followupQuestionsList : ""}`} tokens={{ childrenGap: 6 }}>
                        <span className={styles.followupQuestionLearnMore}>Follow-up questions:</span>
                        {followupQuestions.map((x, i) => {
                            return (
                                <a key={i} className={styles.followupQuestion} title={x} onClick={() => onFollowupQuestionClicked(x)}>
                                    {`${x}`}
                                </a>
                            );
                        })}
                    </Stack>
                </Stack.Item>
            )}
 
            <FeedbackModal
                isOpen={isModalOpen}
                onClose={() => setModalOpen(false)}
                onSubmit={handleFeedbackSubmit}
            />
        </Stack>
    );
};