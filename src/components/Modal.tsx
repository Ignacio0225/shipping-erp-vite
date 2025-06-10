import styles from './Modal.module.css';
// 👉 CSS 모듈 방식으로 스타일을 import.
// 클래스명 중복을 막고, 각 컴포넌트별로 스타일 격리를 위해 사용.

import * as React from "react";

// 👉 React에서 JSX를 사용하기 위해 import (함수형 컴포넌트 선언에 필요).

interface ModalProps {
    isOpen: boolean;               // 모달이 열려 있는지(true/false)
    onClose: () => void;           // 모달을 닫는 함수 (부모에서 전달)
    children: React.ReactNode;     // 모달 안에 표시할 실제 내용(폼 등) (어떤 부모컨포넌트도 받을 수 있게 children 사용)
}

// 👉 Modal 컴포넌트가 받을 props의 타입(TypeScript 사용).

export default function Modal({isOpen, onClose, children}: ModalProps) {
    // 👉 props를 구조분해 할당해서 변수처럼 사용.

    if (!isOpen) return null;
    // 👉 isOpen이 false(모달을 열지 않을 때)에는 아무것도 렌더링하지 않음.
    // 이렇게 하면 화면에서 모달 요소가 완전히 사라짐(메모리, DOM 모두 사라짐).

    // 실제 모달 스타일은 css로
    return (
        <div
            className={styles["modal-backdrop"]}
            onClick={onClose}
        >
            {/*
            👉 화면 전체를 덮는 검정/회색 반투명 배경.
            클릭 이벤트가 발생하면 onClose 함수(=모달 닫기)를 실행.
            (즉, 모달 바깥 아무 곳이나 클릭하면 닫힘)
          */}
            <div
                className={styles["modal-content"]}
                onClick={e => e.stopPropagation()}
            >
                {/*
                👉 모달 창(실제 내용 영역).
                onClick={e => e.stopPropagation()}
                → 이벤트 버블링을 막아 부모의 onClick(onClose)이 실행되지 않도록 함.
                즉, 모달 안을 클릭해도 모달이 닫히지 않게 함(바깥만 닫힘).
              */}
                <button
                    onClick={onClose}
                    className={styles["modal-close-btn"]}
                >
                    닫기
                </button>
                {/* 👉 우측상단(혹은 원하는 위치)에 표시되는 닫기 버튼. onClick 시 모달을 닫는 함수 호출.*/}
                {children}
                {/* 👉 부모 컴포넌트에서 전달된 내용(로그인 폼, 메시지 등) 실제로 표시.*/}
            </div>
        </div>
    );
}
