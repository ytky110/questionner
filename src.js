class Elements {
    constructor() {
        const $ = id => document.getElementById(id);
        this.load_div = $("load");
        this.loaded_div = $("loaded");
        this.title_output = $("title");
        this.file_input = $("file");
        this.qnumber_output = $("qnumber");
        this.exnumber_input = $("exnumber");
        this.start_button = $("start");

        this.ex_div = $("ex");
        this.instructions_output = $("instructions");
        this.question_output = $("question");
        this.input_div = $("input_div");
        this.input_input = $("input");
        this.choice_div = $("choice");
        this.check_button = $("check");
        this.response_div = $("response_div");
        this.response_output = $("response");
        this.self_buttons_div = $("self_buttons");
        this.ok_button = $("ok");
        this.bad_button = $("bad");
        this.judge_div = $("judge");
        this.message_output = $("message");
        this.next_button = $("next");

        this.result_div = $("result");
        this.points_output = $("points");

        this.error_div = $("error");
        this.errmsg_output = $("errmsg");
    }

    hide_all() {
        this.load_div.hidden = true;
        this.loaded_div.hidden = true;
        this.exnumber_input.value = 0;

        this.ex_div.hidden = true;
        this.choice_div.hidden = true;
        this.input_div.hidden = true
        this.response_div.hidden = true;
        this.self_buttons_div.hidden = true;
        this.judge_div.hidden = true;

        this.result_div.hidden = true;
        this.error_div.hidden = true;
    }

    show_load() {
        this.hide_all();
        this.load_div.hidden = false;
    }

    show_loaded() {
        this.show_load();
        this.loaded_div.hidden = false;
    }

    show_ex() {
        this.hide_all();
        this.ex_div.hidden = false;
    }

    show_ex_choice() {
        this.show_ex();
        this.choice_div.hidden = false;
    }

    show_ex_checked() {
        this.show_ex_choice();
        this.response_div.hidden = false;
        this.judge_div.hidden = false;
    }

    show_ex_self() {
        this.show_ex();
        this.input_div.hidden = false;
    }

    show_ex_self_checked() {
        this.show_ex_self();
        this.response_div.hidden = false;
        this.self_buttons_div.hidden = false;
    }

    show_result() {
        this.hide_all();
        this.result_div.hidden = false;
    }
}

// main
class App {
    constructor() {
        this.elements = new Elements();
        this.qdata = {};
        this.qlist = [];
        this.qactual = {};
        this.exnumber = 0;
        this.points = 0;

        this.elements.file_input.addEventListener("change", () => {this.load_qdata()});
        this.elements.start_button.addEventListener("click", () => {this.start()});
        this.elements.check_button.addEventListener("click", () => {this.check()});
        this.elements.ok_button.addEventListener("click", () => {
            this.points += 1;
            this.next();
        });
        this.elements.bad_button.addEventListener("click", () => {this.next()});
        this.elements.next_button.addEventListener("click", () => {this.next()});

        this.elements.show_load();
    }

    async load_qdata() {
        const text = await this.elements.file_input.files[0].text();
        this.qdata = JSON.parse(text);

        const qnumber = this.qdata.questions.length;
        if (qnumber === 0) {
            this.print_error("不正なデータ：質問が含まれていません。");
            return;
        }

        this.elements.show_loaded();

        this.elements.title_output.textContent = this.qdata.title;
        this.elements.qnumber_output.textContent = qnumber.toString();
        this.elements.exnumber_input.value = qnumber;
    }

    start() {
        if (!this.qdata.questions) {
            this.print_error("ファイルが読み込まれていないか、不正なデータです。");
            return;
        }

        this.exnumber = Number(this.elements.exnumber_input.value);

        if (
            !Number.isInteger(this.exnumber) ||
            this.exnumber < 1 ||
            this.exnumber > this.qdata.questions.length
        ) {
            this.print_error("不正な出題数：有効な数を入力してください。");
            return;
        }

        const questions = this.qdata.questions;
        const shuffled = [...questions];

        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }

        this.qlist = shuffled.slice(0, this.exnumber);
        this.next();
    }

    next() {
        if (this.qlist.length === 0) {
            this.result();
            return;
        }
        this.qactual = this.qlist.shift();

        this.elements.show_ex();
        this.elements.input_input.value = "";
        this.elements.question_output.textContent = this.qactual.question;

        switch (this.qactual.type) {
            case "choice":
                this.set_choice();
                break;
            case "self":
                this.set_self();
                break;
            default:
                this.print_error("不正なデータ：不明な問題形式");
                break;
        }
    }

    set_choice() {
        this.elements.show_ex_choice();
        this.elements.instructions_output.textContent = "選択肢を選んで確認ボタンを押してください";

        const container = this.elements.choice_div;
        container.replaceChildren();

        if (this.qactual.choices.length === 0) {
            this.print_error("不正なデータ：選択肢がありません");
            return;
        }

        for (const choice of this.qactual.choices) {
            const label = document.createElement("label");
            const radio = document.createElement("input");

            radio.type = "radio";
            radio.name = "answer";
            radio.value = choice;

            label.append(radio, choice);
            container.append(label);
        }
    }

    set_self() {
        this.elements.instructions_output.textContent = "自由に入力し、確認ボタンを押してください（入力内容は正誤に影響しません）。正誤判定は答えを見て行ってください";
        this.elements.show_ex_self();
    }

    check() {
        console.log("check()");
        this.elements.response_output.textContent = this.qactual.answer;
        switch (this.qactual.type) {
            case "choice":
                this.check_choice();
                break;
            case "self":
                this.check_self();
                break;
            default:
                this.print_error("不正なデータ：不明な問題形式");
                break;
        }
    }

    check_choice() {
        this.elements.show_ex_checked();
        const selected = document.querySelector('[name="answer"]:checked')?.value;

        if (selected === this.qactual.answer) {
            this.elements.message_output.textContent = "正解！";
            this.points += 1;
        } else {
            this.elements.message_output.textContent = "不正解…";
        }
    }

    check_self() {
        this.elements.show_ex_self_checked();
    }

    result() {
        this.elements.show_result();
        this.elements.points_output.textContent = String(this.points) + "/" + String(this.exnumber);
    }

    print_error(str) {
        this.elements.error_div.hidden = false;
        this.elements.errmsg_output.textContent = str;
    }
}

new App();
