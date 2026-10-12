class Elements {
    constructor() {
        const $ = id => document.getElementById(id);
        this.load_div = $("load");
        this.file_input = $("file");
        this.qnumber_output = $("qnumber");
        this.exnumber_input = $("exnumber");
        this.start_button = $("start");

        this.ex_div = $("ex");
        this.instructions_output = $("instructions");
        this.question_output = $("question");
        this.input_input = $("input");
        this.choice_div = $("choice");
        this.check_button = $("check");
        this.response_output = $("response");
        this.ok_button = $("ok");
        this.bad_button = $("bad");
        this.next_button = $("next");

        this.result_div = $("result");
        this.points_output = $("points");

        this.error_div = $("error");
        this.errmsg_output = $("errmsg");
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
        this.elements.check_button.addEventListener("click", () => {this.check});
        this.elements.ok_button.addEventListener("click", () => {
            this.points += 1;
            this.next();
        });
        this.elements.bad_button.addEventListener("click", () => {this.next});
        this.elements.next_button.addEventListener("click", () => {this.next});
    }

    async load_qdata() {
        const text = await this.elements.file_input.files[0].text();
        this.qdata = JSON.parse(text);

        const qnumber = this.qdata.questions.length;
        if (qnumber === 0) {
            this.print_error("不正なデータ：質問が含まれていません。");
            return;
        }

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
        this.qactual = this.qlist.shift();

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
    }

    check() {
    }

    print_error(str) {
        this.elements.error_div.hidden = false;
        this.elements.errmsg_output.textContent = str;
    }
}

new App();
